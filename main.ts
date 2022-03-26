import {Plugin} from "obsidian";

const KEYMAP: Record<string, string> = {">": "right", "<": "left", "^": "center"};
const COLORS = [ "red", "yellow", "blue", "purple", "green", "grey" ];

export default class ChatViewPlugin extends Plugin {

	override async onload(): Promise<void> {
		this.registerMarkdownCodeBlockProcessor("chat", (source, el, _) => {
			const rawLines = source.split("\n").filter((line) => /(^>|<|\^)|...|\[(.*?)\]|^#/.test(line.trim()));
			const lines = rawLines.map((rawLine) => rawLine.trim());
			const colorConfigs = new Map<string, string>();
			for (const line of lines) {
				if (/\[(.*?)\]/.test(line)) {
					const configs = line.replace("[", "").replace("]", "").split(",").map((l) => l.trim());
					for (const config of configs) {
						const entry = config.split("=").map((c) => c.trim());
						if (COLORS.contains(entry[ 1 ])) colorConfigs.set(entry[ 0 ], entry[ 1 ]);
					}
				}
			}
			for (let index = 0; index < lines.length; index++) {
				const line = lines[ index ].trim();
				if (/^#/.test(line)) {
					el.createEl("p", {text: line.substring(1).trim(), cls: [ "chat-view-comment" ]})
				} else if (line === "...") {
					const delimiter = el.createDiv({cls: [ "delimiter" ]});
					for (let i = 0; i < 3; i++) delimiter.createDiv({cls: [ "dot" ]});
				} else if (/^>|<|\^/.test(line)) {
					const components = line.substring(1).split("|");
					if (components.length > 0) {
						const first = components[ 0 ];
						const head = components.length > 1 && /[a-zA-Z0-9]/.test(first) ? first.trim() : "";
						const msg = components.length > 1 ? components[ 1 ].trim() : first.trim();
						const sub = components.length > 2 ? components[ 2 ].trim() : "";
						const continued = index > 0 && line.charAt(0) === lines[ index - 1 ].charAt(0) && head === "";
						this.createChatBubble(head, msg, sub, KEYMAP[ line.charAt(0) ], el, continued, colorConfigs);
					}
				}
			}
		});
	}

	createChatBubble(
		header: string, message: string, subtext: string, align: string, element: HTMLElement, continued: boolean,
		colorConfigs: Map<string, string>
	) {
		const marginClass = continued ? "chat-view-small-vertical-margin" : "chat-view-default-vertical-margin";
		const colorConfigClass = `chat-view-${ colorConfigs.get(header) }`;
		const bubble = element.createDiv({cls: [ "chat-view-bubble", `chat-view-align-${ align }`, marginClass ]});
		if (header.length > 0) bubble.createEl("h4", {text: header, cls: [ "chat-view-header", colorConfigClass ]});
		if (message.length > 0) bubble.createEl("p", {text: message, cls: [ "chat-view-message" ]});
		if (subtext.length > 0) bubble.createEl("sub", {text: subtext, cls: [ "chat-view-subtext" ], });
	}
}