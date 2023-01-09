import {Plugin, Platform, moment} from "obsidian";
import * as webvtt from "node-webvtt";
import * as showdown from "showdown";
import * as katex from "katex";


const KEYMAP: Record<string, string> = {">": "right", "<": "left", "^": "center"};
const CONFIGS: Record<string, string[]> = {
	"header": ["h2", "h3", "h4", "h5", "h6"],
	"mw": ["50", "55", "60", "65", "70", "75", "80", "85", "90"],
	"mode": ["default", "minimal"],
};
const COLORS = [
	"red", "orange", "yellow", "green", "blue", "purple", "grey", "brown", "indigo", "teal", "pink", "slate", "wood"
];

abstract class ChatPatterns {
	static readonly message = /(^>|<|\^)/;
	static readonly delimiter = /.../;
	static readonly comment = /^#/;
	static readonly colors = /\[(.+?)\]/;
	static readonly format = /{(.+?)}/;
	static readonly joined = RegExp([this.message, this.delimiter, this.colors, this.comment, this.format]
		.map((pattern) => pattern.source)
		.join("|"));
	static readonly voice = /<v\s+([^>]+)>([^<]+)<\/v>/;
}

abstract class TranscriptPatterns {
	static readonly message = /^(\(.+?\)|\[.+?\])(.+?)$/;
	static readonly specialComment = /^\*\*\*(.+?)\*\*\*$/;
	static readonly subtext = /^(\(.+?\)|\[.+?\])/;
	static readonly format = /{(.+?)}/;
	static readonly colors = /^\[(.+?)\]$/;
	static readonly align = /^>(.+?)(?:,|$)$/;
	static readonly configs = RegExp([this.format, this.colors, this.align].map((pattern) => pattern.source).join("|"));
}

type Message = {
	readonly header: string;
	readonly body: string;
	readonly subtext: string;
}

export default class ChatViewPlugin extends Plugin {

	override async onload(): Promise<void> {
		this.registerMarkdownCodeBlockProcessor("chat-transcript", (source, el, _) => {
			const lines = source.split("\n").map((val) => val.trim());
			const formats = new Map<string, string>();
			const colors = new Map<string, string>();
			const rightAlignHeaders: string[] = [];
			for (const line of lines) {
				if (TranscriptPatterns.format.test(line)) {
					const configs = line.replace("{", "").replace("}", "").split(",").map((l) => l.trim());
					for (const config of configs) {
						const [k, v] = config.split("=").map((c) => c.trim());
						if (Object.keys(CONFIGS).includes(k) && CONFIGS[k].includes(v)) formats.set(k, v);
					}
				} else if (TranscriptPatterns.colors.test(line)) {
					const configs = line.replace("[", "").replace("]", "").split(",").map((l) => l.trim());
					for (const config of configs) {
						const [k, v] = config.split("=").map((c) => c.trim());
						if (k.length > 0 && COLORS.includes(v)) colors.set(k, v);
					}
				} else if (TranscriptPatterns.align.test(line)) {
					rightAlignHeaders.push(...line.substring(1).split(",").map((val) => val.trim()));
				}
			}
			for (let index = 0; index < lines.length; index++) {
				const line = lines[index].trim();
				if (TranscriptPatterns.message.test(line)) {
					const subtext = line.match(TranscriptPatterns.subtext)[0].replace(/\(|\)|\[|\]/g, "");
					const main = line.substring(subtext.length + 2).trim().split(":");
					if (main.length === 1 && TranscriptPatterns.specialComment.test(main[0])) {
						el.createEl("p", {text: main[0].replace(/\*/g, "").trim(), cls: ["chat-view-comment"]});
					} else {
						const header = main.length === 1 ? "" : main[0];
						const body = main.length === 1 ? main[0] : main[1];
						let prev = "";
						const prevLine = lines[(index - 1 < 0 ? 0 : index - 1)].trim();
						if (TranscriptPatterns.message.test(prevLine)) {
							const prevSubtext = prevLine.match(TranscriptPatterns.subtext)[0];
							const prevMain = prevLine.substring(prevSubtext.length).trim().split(":");
							prev = prevMain.length === 1 ? "" : main[0];
						}
						const align = rightAlignHeaders.includes(header) ? "right" : "left";
						const continued = prev === header || header === "";
						this.createChatBubble(header, prev, body, subtext, align, el, continued, colors, formats);
					}
				} else if (line === "...") {
					const delimiter = el.createDiv({cls: ["delimiter"]});
					for (let i = 0; i < 3; i++) delimiter.createDiv({cls: ["dot"]});
				} else if (!TranscriptPatterns.configs.test(line)) {
					el.createEl("p", {text: line, cls: ["chat-view-comment"]});
				}
			}
		});
		this.registerMarkdownCodeBlockProcessor("chat-webvtt", (source, el, _) => {
			const vtt = webvtt.parse(source, {meta: true});
			const messages: Message[] = [];
			const self = vtt.meta && "Self" in vtt.meta ? vtt.meta.Self as string : undefined;
			const selves = self ? self.split(",").map((val) => val.trim()) : undefined;

			const formatConfigs = new Map<string, string>();
			const maxWidth = vtt.meta && "MaxWidth" in vtt.meta ? vtt.meta.MaxWidth : undefined;
			const headerConfig = vtt.meta && "Header" in vtt.meta ? vtt.meta.Header : undefined;
			const modeConfig = vtt.meta && "Mode" in vtt.meta ? vtt.meta.Mode : undefined;
			if (CONFIGS["mw"].includes(maxWidth)) formatConfigs.set("mw", maxWidth);
			if (CONFIGS["header"].includes(headerConfig)) formatConfigs.set("header", headerConfig);
			if (CONFIGS["mode"].includes(modeConfig)) formatConfigs.set("mode", modeConfig);
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
				const align = selves && selves.includes(message.header) ? "right" : "left";
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
			const formats = new Map<string, string>();
			const colors = new Map<string, string>();
			for (const line of lines) {
				if (ChatPatterns.format.test(line)) {
					const configs = line.replace("{", "").replace("}", "").split(",").map((l) => l.trim());
					for (const config of configs) {
						const [k, v] = config.split("=").map((c) => c.trim());
						if (Object.keys(CONFIGS).includes(k) && CONFIGS[k].includes(v)) formats.set(k, v);
					}
				} else if (ChatPatterns.colors.test(line)) {
					const configs = line.replace("[", "").replace("]", "").split(",").map((l) => l.trim());
					for (const config of configs) {
						const [k, v] = config.split("=").map((c) => c.trim());
						if (k.length > 0 && COLORS.includes(v)) colors.set(k, v);
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
					const components = line.substring(1).replaceAll("\\|", "#%&#").split("|").map((value) => {
						return value.replaceAll("#%&#", "|").trim();
					});
					if (components.length > 0) {
						const first = components[0];
						const head = components.length > 1 ? first.trim() : "";
						const msg = components.length > 1 ? components[1].trim() : first.trim();
						const sub = components.length > 2 ? components[2].trim() : "";
						const cont = index > 0 && line.charAt(0) === lines[index - 1].charAt(0) && head === "";
						let prev = "";
						if (cont) {
							continuedCount++;
							const prevComponents = lines[index - continuedCount].trim().substring(1).split("|");
							prev = prevComponents[0].length > 1 ? prevComponents[0].trim() : "";
						} else {
							continuedCount = 0;
						}
						this.createChatBubble(head, prev, msg, sub, KEYMAP[line.charAt(0)], el, cont, colors, formats);
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
		const modeClass = `chat-view-bubble-mode-${formatConfigs.has("mode") ? formatConfigs.get("mode") : "default"}`;
		const headerEl: keyof HTMLElementTagNameMap = formatConfigs.has("header") ?
			formatConfigs.get("header") as keyof HTMLElementTagNameMap :
			"h4";
		const bubble = element.createDiv({
			cls: ["chat-view-bubble", `chat-view-align-${align}`, marginClass, colorConfigClass, widthClass, modeClass]
		});
		if (header.length > 0) bubble.createEl(headerEl, {text: header, cls: ["chat-view-header"]});
		if (message.length > 0) {
			const latexMessage = message.split("$$").map((value, index) => {
				return index % 2 === 1 ? katex.default.renderToString(value, {displayMode: true}) : value;
			}).join("");
			const converter = new showdown.Converter();
			bubble.innerHTML += converter.makeHtml(latexMessage);
			const paras = bubble.getElementsByTagName("p");
			for (let index = 0; index < paras.length; index++) {
				paras[index].className = "chat-view-message";
			}
		}
		if (subtext.length > 0) bubble.createEl("sub", {text: subtext, cls: ["chat-view-subtext"]});
	}
}