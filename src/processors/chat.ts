import {MarkdownPostProcessorContext, MarkdownRenderChild, MarkdownRenderer, Plugin} from "obsidian";
import {ChatComment, ChatDelimeter, ChatMessage, ChatNode} from "../types";

abstract class Patterns {
  static readonly message = /^(?<msg>(?<dir>[<>^])\{\{(?<header>[^|\n]*)\|(?<body>[\s\S]*?)(?:\|(?<subtext>[^|\n]*))?\}\})\s*$/;
  static readonly delimiter = /^(?<del>\.\.\.)\s*$/;
  static readonly comment = /^(?<cmt>#\s*(?<text>.*))$/;
  static readonly node = new RegExp([this.message.source, this.delimiter.source, this.comment.source].join("|"), "gm");
  static readonly sides = {">": "right", "<": "left", "^": "center"};
}

export async function chatHandler(plugin: Plugin, src: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
  const nodes: ChatNode[] = [];
  for (const match of src.matchAll(Patterns.node)) {
    const group = match.groups!;
    if (group.msg !== undefined) {
      nodes.push(<ChatMessage>{
        kind: "message",
        side: Patterns.sides[group.dir as keyof typeof Patterns.sides],
        header: unescapePipe(group.header ?? ""),
        body: unescapePipe(group.body ?? ""),
        subtext: unescapePipe(group.subtext ?? ""),
      });
    } else if (group.del !== undefined) {
      nodes.push(<ChatDelimeter>{kind: "delimeter"});
    } else if (group.cmt !== undefined) {
      nodes.push(<ChatComment>{kind: "comment", body: group.text ?? ""});
    }
  }
  await renderChat(plugin, nodes, el, ctx);
}

async function renderChat(plugin: Plugin, nodes: ChatNode[], el: HTMLElement, ctx: MarkdownPostProcessorContext) {
  const chatViewDiv = el.createDiv({cls: ["chat-view"]});
  for (const node of nodes) {
    if (node.kind === "message") {
      const messageDiv = chatViewDiv.createDiv({cls: ["chat-view-message", `chat-view-message-${node.side}`]});
      if (node.header.length > 0) {
        messageDiv.createDiv({cls: ["chat-view-header"], text: node.header});
      }
      if (node.body.length > 0) {
        const bodyDiv = messageDiv.createDiv({cls: ["chat-view-body"]});
        const child = new MarkdownRenderChild(bodyDiv);
        ctx.addChild(child);
        await MarkdownRenderer.render(plugin.app, node.body, bodyDiv, ctx.sourcePath, child);
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

function unescapePipe(s: string): string {
  return s.trim().replace(/\\\|/g, "|");
}