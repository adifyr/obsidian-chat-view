import {Plugin} from "obsidian";
import {chatHandler} from "./processors/chat";
import {chatOldHandler} from "./processors/chat-old";
import {chatWebvttHandler} from "./processors/chat-webvtt";
import {chatZendeskHandler} from "./processors/chat-zendesk";
import {chatIntercomHandler} from "./processors/chat-intercom";

export default class ChatViewPlugin extends Plugin {
	async onload() {
		console.debug("Loading Obsidian Chat View...")
		this.registerMarkdownCodeBlockProcessor("chat", async (source, element, context) => {
			await chatHandler(this, source, element, context);
		});
		this.registerMarkdownCodeBlockProcessor("chat-old", async (source, element, context) => {
			await chatOldHandler(this, source, element, context);
		});
		this.registerMarkdownCodeBlockProcessor("chat-webvtt", async (source, element, context) => {
			await chatWebvttHandler(this, source, element, context);
		});
		this.registerMarkdownCodeBlockProcessor("chat-zendesk", async (source, element, context) => {
			await chatZendeskHandler(this, source, element, context);
		});
		this.registerMarkdownCodeBlockProcessor("chat-intercom", async (source, element, context) => {
			await chatIntercomHandler(this, source, element, context);
		});
	}

	onunload() {
		// Release any resources needed by the plugin.
		console.debug("Unloading Plugin...")
	}
}
