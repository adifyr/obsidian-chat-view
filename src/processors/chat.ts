import {MarkdownPostProcessorContext, Plugin} from "obsidian";
import {renderChat} from "../renderer";
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
  await renderChat(plugin.app, nodes, el, ctx);
}

function unescapePipe(s: string): string {
  return s.trim().replace(/\\\|/g, "|");
}