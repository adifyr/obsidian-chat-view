import {Plugin} from "obsidian";

export default class ChatViewPlugin extends Plugin {
	async onload() {
		// Configure resources needed by the plugin.
		console.log("Loading Plugin...")
	}

	onunload() {
		// Release any resources needed by the plugin.
		console.log("Unloading Plugin...")
	}
}
