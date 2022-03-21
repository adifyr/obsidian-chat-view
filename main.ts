import { Plugin } from 'obsidian';

const KEY_MAP: Record<string, string> = {">": "left", "<": "right", "^": "center"};

export default class ChatViewPlugin extends Plugin {
	override async onload(): Promise<void> {
		this.registerMarkdownCodeBlockProcessor("chat", (source, element, ctx) => {
			const lines = source.split("\n").filter((line) => /(^>|<|\^)|\.\.\./.test(line));
			for (const line of lines) {
				const components = line.substring(1).split("|");
				if (components.length > 0) {
					const header = components.length > 1 ? components[0] : "";
					const message = components.length > 1 ? components[1] : components[0];
					const subtext = components.length > 2 ? components[2] : "";
					this.chatBubble(element, header, message, subtext, KEY_MAP[line.charAt(0)]);
				}
			}
		});
	}

	override async onunload(): Promise<void> {}

	async chatBubble(element: HTMLElement, header: string, message: string, subtext: string, align: string) {
		const bubble = element.createEl("div", { cls: ["chat-view-bubble", `chat-view-align-${align}`] });
		if (header.length > 0) bubble.createEl("h4", { text: header, cls: ["chat-view-header"] });
		if (message.length > 0) bubble.createEl("p", { text: message, cls: ["chat-view-message"] });
		if (subtext.length > 0) bubble.createEl("sub", { text: subtext, cls: ["chat-view-subtext"] })
	}
}