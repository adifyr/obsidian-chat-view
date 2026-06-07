import {App, MarkdownRenderChild, MarkdownRenderer} from "obsidian";
import {ChatNode, Context} from "./types";

const colors = ["blue", "green", "red", "cyan", "yellow", "orange", "purple", "pink"];

export async function renderChat(app: App, nodes: ChatNode[], el: HTMLElement, ctx: Context) {
  const chatViewDiv = el.createDiv({cls: ["chat-view"]});
  const headerColors = new Map<string, string>();
  let prev: ChatNode | undefined;
  for (const node of nodes) {
    if (node.kind === "message") {
      const isContinued = prev?.kind === "message" && (node.header === prev.header || node.header.length === 0);
      const messageDiv = chatViewDiv.createDiv({
        cls: [
          "chat-view-message",
          `chat-view-message-${node.side}`,
          ...(isContinued ? ["chat-view-message-continued"] : []),
        ]
      });
      if (node.header.length > 0 && !isContinued) {
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
    } else if (node.kind === "delimiter") {
      const delimiter = chatViewDiv.createDiv({cls: ["chat-view-delimiter"]});
      for (let i = 0; i < 3; i++) {
        delimiter.createDiv({cls: ["chat-view-delimiter-dot"]});
      }
    }
    prev = node;
  }
}