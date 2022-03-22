import { Plugin } from 'obsidian';

const KEY_MAP: Record<string, string> = {">": "left", "<": "right", "^": "center"};

export default class ChatViewPlugin extends Plugin {
	override async onload(): Promise<void> {
		this.registerMarkdownCodeBlockProcessor("chat", (source, element, _) => {
			const lines = source.split("\n").filter((line) => /^>|<|\^/.test(line.trim()));
			for (const line of lines) {
				const components = line.substring(1).split("|");
				if (components.length > 0) {
					const header = components.length > 1 && /[a-zA-Z0-9]/.test(components[0]) ? components[0].trim() : "";
					const message = components.length > 1 ? components[1].trim() : components[0].trim();
					const subtext = components.length > 2 ? components[2].trim() : "";
					this.createChatBubble(header, message, subtext, KEY_MAP[line.charAt(0)], element);
				}
			}
		});
	}

	createChatBubble(header: string, message: string, subtext: string, align: string, element: HTMLElement): void {
		const bubble = element.createEl("div", { cls: ["chat-view-bubble", `chat-view-align-${align}`] });
		if (header.length > 0) bubble.createEl("h4", { text: header, cls: ["chat-view-header"] });
		if (message.length > 0) bubble.createEl("p", { text: message, cls: ["chat-view-message"] });
		if (subtext.length > 0) bubble.createEl("sub", { text: subtext, cls: ["chat-view-subtext"] });
	}
}