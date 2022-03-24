import {Plugin} from "obsidian";

const KEYMAP: Record<string, string> = {">": "left", "<": "right", "^": "center"};
const COLORS = [ "red", "yellow", "blue", "purple", "green", "grey" ];

export default class ChatViewPlugin extends Plugin {
	override async onload(): Promise<void> {
		this.registerMarkdownCodeBlockProcessor("chat", (source, element, _) => {
			const rawLines = source.split("\n").filter((line) => /(^>|<|\^)|\.\.\.|(^\[$\])/.test(line.trim()));
			const lines = rawLines.map((rawLine) => rawLine.trim());
			const colorConfigs = new Map<string, string>();
			for (const line of lines) {
				const config = line.replace(/\[|\]/, "").split("=").map((str) => str.trim());
				if (/^\[$\]/.test(line)) {
					if (COLORS.contains(config[ 1 ])) {
						colorConfigs.set(config[ 0 ], config[ 1 ]);
					}
				}
			}
			console.log(colorConfigs);
			for (let index = 0; index < lines.length; index++) {
				const line = lines[ index ];
				if (line === "...") {
					this.createDelimiter(element);
				} else {
					const components = line.substring(1).split("|");
					if (components.length > 0) {
						const header = components.length > 1 && /[a-zA-Z0-9]/.test(components[ 0 ])
							? components[ 0 ].trim() : "";
						const message = components.length > 1 ? components[ 1 ].trim() : components[ 0 ].trim();
						const subtext = components.length > 2 ? components[ 2 ].trim() : "";
						const continued = index > 0 && line.charAt(0) === lines[ index - 1 ].charAt(0);
						this.createChatBubble(
							header, message, subtext, KEYMAP[ line.charAt(0) ], element, continued, colorConfigs
						);
					}
				}
			}
		});
	}

	createDelimiter(element: HTMLElement) {
		const delimiter = element.createDiv({cls: [ "delimiter" ]});
		for (let i = 0; i < 3; i++) {
			delimiter.createDiv({cls: [ "dot" ]});
		}
	}

	createChatBubble(
		header: string, message: string, subtext: string, align: string, element: HTMLElement, continued: boolean,
		colorConfigs: Map<string, string>
	) {
		const bubble = element.createDiv({
			cls: [
				"chat-view-bubble",
				`chat-view-align-${ align }`,
				continued ? "chat-view-small-vertical-margin" : "chat-view-default-vertical-margin"
			],
		});
		if (header.length > 0) bubble.createEl("h4", {
			text: header, cls: [
				"chat-view-header", `chat-view-${ colorConfigs.get(header) }`
			]
		});
		if (message.length > 0) bubble.createEl("p", {text: message, cls: [ "chat-view-message" ]});
		if (subtext.length > 0) bubble.createEl("sub", {text: subtext, cls: [ "chat-view-subtext" ], });
	}
}
