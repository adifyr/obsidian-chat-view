import {Plugin, Platform, moment} from "obsidian";
import * as webvtt from "node-webvtt";


const KEYMAP: Record<string, string> = {">": "right", "<": "left", "^": "center"};
const COLORS = [
	"red", "orange", "yellow", "green", "blue", "purple", "grey", "brown", "indigo", "teal", "pink", "slate", "wood"
];
const HEADERS = ["h2", "h3", "h4", "h5", "h6"];
const MAX_WIDTHS = ["50", "55", "60", "65", "70", "75", "80", "85", "90"];

class ChatPatterns {
	static readonly message = /(^>|<|\^)/;
	static readonly delimiter = /.../;
	static readonly comment = /^#/;
	static readonly colors = /\[(.*?)\]/;
	static readonly format = /{(.*?)}/;
	static readonly joined = RegExp([this.message, this.delimiter, this.colors, this.comment, this.format]
		.map((pattern) => pattern.source)
		.join("|"));
	static readonly voice = /<v\s+([^>]+)>([^<]+)<\/v>/;
}

interface Message {
	readonly header: string;
	readonly body: string;
	readonly subtext: string;
}

export default class ChatViewPlugin extends Plugin {

	override async onload(): Promise<void> {
		this.registerMarkdownCodeBlockProcessor("chat-webvtt", (source, el, _) => {
			const vtt = webvtt.parse(source, {meta: true});
			const messages: Message[] = [];
			const self = vtt.meta && "Self" in vtt.meta ? vtt.meta.Self : undefined;
			console.log(`Self is ${self}`);

			const formatConfigs = new Map<string, string>();
			const maxWidth = vtt.meta && "MaxWidth" in vtt.meta ? vtt.meta.MaxWidth : undefined;
			const headerConfig = vtt.meta && "Header" in vtt.meta ? vtt.meta.Header : undefined;
			if (MAX_WIDTHS.contains(maxWidth)) formatConfigs.set("mw", maxWidth);
			if (HEADERS.contains(headerConfig)) formatConfigs.set("header", headerConfig);
			console.log(formatConfigs);

			for (let index = 0; index < vtt.cues.length; index++) {
				const cue = vtt.cues[index];
				const start = moment(Math.round(cue.start * 1000)).format("HH:mm:ss.SSS");
				const end = moment(Math.round(cue.end * 1000)).format("HH:mm:ss.SSS");
				if (ChatPatterns.voice.test(cue.text)) {
					const matches = (cue.text as string).match(ChatPatterns.voice);
					messages.push(<Message>{header: matches[1], body: matches[2], subtext: `${start} to ${end}`});
				} else {
					messages.push(<Message>{header: "", body: cue.text, subtext: `${start} to ${end}`});
				}
			}

			const headers = messages.map((message) => message.header);
			const uniqueHeaders = new Set<string>(headers);
			uniqueHeaders.delete("");
			console.log(messages);
			console.log(uniqueHeaders);

			const colorConfigs = new Map<string, string>();
			Array.from(uniqueHeaders).forEach((h, i) => colorConfigs.set(h, COLORS[i % COLORS.length]));
			console.log(colorConfigs);

			messages.forEach((message, index, arr) => {
				const prevHeader = index > 0 ? arr[index - 1].header : "";
				const align = self && message.header === self ? "right" : "left";
				const continued = message.header === prevHeader;
				this.createChatBubble(
					continued ? "" : message.header, prevHeader, message.body, message.subtext, align, el,
					continued, colorConfigs, formatConfigs,
				);
			});
		});
		this.registerMarkdownCodeBlockProcessor("chat", (source, el, _) => {
			const rawLines = source.split("\n").filter((line) => ChatPatterns.joined.test(line.trim()));
			const lines = rawLines.map((rawLine) => rawLine.trim());
			const formatConfigs = new Map<string, string>();
			const colorConfigs = new Map<string, string>();
			for (const line of lines) {
				if (ChatPatterns.format.test(line)) {
					const configs = line.replace("{", "").replace("}", "").split(",").map((l) => l.trim());
					for (const config of configs) {
						const entry = config.split("=").map((c) => c.trim());
						if (entry[0] == "header" && HEADERS.contains(entry[1])) {
							formatConfigs.set("header", entry[1]);
						} else if (entry[0] == "mw" && MAX_WIDTHS.contains(entry[1])) {
							formatConfigs.set("mw", entry[1]);
						}
					}
				} else if (ChatPatterns.colors.test(line)) {
					const configs = line.replace("[", "").replace("]", "").split(",").map((l) => l.trim());
					for (const config of configs) {
						const entry = config.split("=").map((c) => c.trim());
						if (entry[0].length > 0 && COLORS.contains(entry[1])) colorConfigs.set(entry[0], entry[1]);
					}
				}
			}
			let continuedCount = 0;
			for (let index = 0; index < lines.length; index++) {
				const line = lines[index].trim();
				if (ChatPatterns.comment.test(line)) {
					el.createEl("p", {text: line.substring(1).trim(), cls: ["chat-view-comment"]})
				} else if (line === "...") {
					const delimiter = el.createDiv({cls: ["delimiter"]});
					for (let i = 0; i < 3; i++) delimiter.createDiv({cls: ["dot"]});
				} else if (ChatPatterns.message.test(line)) {
					const components = line.substring(1).split("|");
					if (components.length > 0) {
						const first = components[0];
						const header = components.length > 1 ? first.trim() : "";
						const message = components.length > 1 ? components[1].trim() : first.trim();
						const subtext = components.length > 2 ? components[2].trim() : "";
						const continued = index > 0 && line.charAt(0) === lines[index - 1].charAt(0) && header === "";
						let prevHeader = "";
						if (continued) {
							continuedCount++;
							const prevComponents = lines[index - continuedCount].trim().substring(1).split("|");
							prevHeader = prevComponents[0].length > 1 ? prevComponents[0].trim() : "";
						} else {
							continuedCount = 0;
						}
						this.createChatBubble(
							header, prevHeader, message, subtext, KEYMAP[line.charAt(0)], el, continued,
							colorConfigs, formatConfigs,
						);
					}
				}
			}
		});
	}

	private createChatBubble(
		header: string,
		prevHeader: string,
		message: string,
		subtext: string,
		align: string,
		element: HTMLElement,
		continued: boolean,
		colorConfigs: Map<string, string>,
		formatConfigs: Map<string, string>,
	) {
		const marginClass = continued ? "chat-view-small-vertical-margin" : "chat-view-default-vertical-margin";
		const colorConfigClass = `chat-view-${colorConfigs.get(continued ? prevHeader : header)}`;
		const widthClass = formatConfigs.has("mw") ?
			`chat-view-max-width-${formatConfigs.get("mw")}`
			: (Platform.isMobile ? "chat-view-mobile-width" : "chat-view-desktop-width");
		const headerEl: keyof HTMLElementTagNameMap = formatConfigs.has("header") ?
			formatConfigs.get("header") as keyof HTMLElementTagNameMap :
			"h4";
		const bubble = element.createDiv({
			cls: ["chat-view-bubble", `chat-view-align-${align}`, marginClass, colorConfigClass, widthClass]
		});
		if (header.length > 0) bubble.createEl(headerEl, {text: header, cls: ["chat-view-header"]});
		if (message.length > 0) bubble.createEl("p", {text: message, cls: ["chat-view-message"]});
		if (subtext.length > 0) bubble.createEl("sub", {text: subtext, cls: ["chat-view-subtext"]});
	}
}