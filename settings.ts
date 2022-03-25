import ChatViewPlugin from "main";
import {App, PluginSettingTab, Setting} from "obsidian";

export class ChatViewSettingsTab extends PluginSettingTab {
    plugin: ChatViewPlugin;

    constructor(app: App, plugin: ChatViewPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    override display(): void {
        const {containerEl} = this;
        containerEl.empty();
        new Setting(containerEl)
            .setName("Reverse Arrows Direction")
            .setDesc("Reverse the direction of the chat messages denoted by the '<' and '>' arrows.")
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.settings.reverse).onChange(async (value) => {
                    this.plugin.settings.reverse = value;
                    await this.plugin.saveSettings();
                });
            });
    }
}