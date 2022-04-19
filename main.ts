import {Plugin, Platform} from "obsidian";

const KEYMAP: Record<string, string> = {">": "right", "<": "left", "^": "center"};
const COLORS = [ "red", "orange", "yellow", "green", "blue", "purple", "grey", "brown", "indigo", "teal" ];
const HEADERS = [ "h2", "h3", "h4", "h5", "h6" ];

class ChatPatterns {
	static readonly message = /(^>|<|\^)/;
	static readonly delimiter = /.../;
	static readonly comment = /^#/;
	static readonly colors = /\[(.*?)\]/;
	static readonly format = /{(.*?)}/;
	static readonly joined = RegExp([ this.message, this.delimiter, this.colors, this.comment, this.format ]
		.map((pattern) => pattern.source)
		.join("|"));
}

export default class ChatViewPlugin extends Plugin {

	override async onload(): Promise<void> {
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
						if (entry[ 0 ] == "header" && HEADERS.contains(entry[ 1 ])) {
							formatConfigs.set("header", entry[ 1 ]);
						}
					}
				} else if (ChatPatterns.colors.test(line)) {
					const configs = line.replace("[", "").replace("]", "").split(",").map((l) => l.trim());
					for (const config of configs) {
						const entry = config.split("=").map((c) => c.trim());
						if (entry[ 0 ].length > 0 && COLORS.contains(entry[ 1 ])) {
							colorConfigs.set(entry[ 0 ], entry[ 1 ]);
						}
					}
				}
			}
			for (let index = 0; index < lines.length; index++) {
				const line = lines[ index ].trim();
				if (ChatPatterns.comment.test(line)) {
					el.createEl("p", {text: line.substring(1).trim(), cls: [ "chat-view-comment" ]})
				} else if (line === "...") {
					const delimiter = el.createDiv({cls: [ "delimiter" ]});
					for (let i = 0; i < 3; i++) delimiter.createDiv({cls: [ "dot" ]});
				} else if (ChatPatterns.message.test(line)) {
					const components = line.substring(1).split("|");
					if (components.length > 0) {
						const first = components[ 0 ];
						const header = components.length > 1 ? first.trim() : "";
						const message = components.length > 1 ? components[ 1 ].trim() : first.trim();
						const subtext = components.length > 2 ? components[ 2 ].trim() : "";
						const continued = index > 0 && line.charAt(0) === lines[ index - 1 ].charAt(0) && header === "";
						const prevComponents = continued ? lines[ index - 1 ].substring(1).split("|") : [];
						const prevHeader = prevComponents.length > 1 ? prevComponents[ 0 ].trim() : "";
						this.createChatBubble(
							header, prevHeader, message, subtext, KEYMAP[ line.charAt(0) ], el, continued,
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
		console.log({
			"message": message,
			"prev_header": prevHeader,
		});
		const marginClass = continued ? "chat-view-small-vertical-margin" : "chat-view-default-vertical-margin";
		const colorConfigClass =
			`chat-view-${ colorConfigs.get(continued && prevHeader.length > 0 ? prevHeader : header) }`;
		const widthClass = Platform.isMobile ? "chat-view-mobile-width" : "chat-view-desktop-width";
		const headerEl: keyof HTMLElementTagNameMap = formatConfigs.has("header") ?
			formatConfigs.get("header") as keyof HTMLElementTagNameMap :
			"h4";
		const bubble = element.createDiv({
			cls: [ "chat-view-bubble", `chat-view-align-${ align }`, marginClass, colorConfigClass, widthClass ]
		});
		if (header.length > 0) bubble.createEl(headerEl, {text: header, cls: [ "chat-view-header" ]});
		if (message.length > 0) bubble.createEl("p", {text: message, cls: [ "chat-view-message" ]});
		if (subtext.length > 0) bubble.createEl("sub", {text: subtext, cls: [ "chat-view-subtext" ], });
	}
}