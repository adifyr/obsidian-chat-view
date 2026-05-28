import {App, MarkdownPostProcessorContext, MarkdownRenderChild, MarkdownRenderer} from "obsidian";
import {ChatNode} from "./types";

const colors = ["blue", "green", "red", "cyan", "yellow", "orange", "purple", "pink"];

export async function renderChat(app: App, nodes: ChatNode[], el: HTMLElement, ctx: MarkdownPostProcessorContext) {
  const chatViewDiv = el.createDiv({cls: ["chat-view"]});
  const headerColors = new Map<string, string>();
  for (const node of nodes) {
    if (node.kind === "message") {
      const messageDiv = chatViewDiv.createDiv({cls: ["chat-view-message", `chat-view-message-${node.side}`]});
      if (node.header.length > 0) {
        if (!headerColors.has(node.header)) headerColors.set(node.header, colors[headerColors.size % colors.length]!);
        messageDiv.createDiv({cls: [`chat-view-header-${headerColors.get(node.header)}`], text: node.header});
      }
      if (node.body.length > 0) {
        const bodyDiv = messageDiv.createDiv({cls: ["chat-view-body"]});
        const child = new MarkdownRenderChild(bodyDiv);
        ctx.addChild(child);
        await MarkdownRenderer.render(app, node.body, bodyDiv, ctx.sourcePath, child);
      }
      if (node.subtext.length > 0) {
        messageDiv.createDiv({cls: ["chat-view-subtext"], text: node.subtext});
      }
    } else if (node.kind === "comment") {
      chatViewDiv.createDiv({cls: ["chat-view-comment"], text: node.body});
    } else if (node.kind === "delimeter") {
      const delimeter = chatViewDiv.createDiv({cls: ["chat-view-delimeter"]});
      for (let i = 0; i < 3; i++) {
        delimeter.createDiv({cls: ["chat-view-delimeter-dot"]});
      }
    }
  }
}