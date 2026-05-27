import {Plugin} from "obsidian";
import {chatHandler} from "./processors/chat";

export default class ChatViewPlugin extends Plugin {
	async onload() {
		// Configure resources needed by the plugin.
		console.debug("Loading Plugin...")
		this.registerMarkdownCodeBlockProcessor("chat", async (src, el, ctx) => await chatHandler(this, src, el, ctx));
	}

	onunload() {
		// Release any resources needed by the plugin.
		console.debug("Unloading Plugin...")
	}
}
