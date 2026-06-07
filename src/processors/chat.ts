import {Plugin} from "obsidian";
import {renderChat} from "../renderer";
import {ChatComment, ChatDelimiter, ChatMessage, ChatNode, Context} from "../types";

abstract class Patterns {
  static readonly message = /^(?<msg>\{\{(?<header>[^|\n]*)\|(?<body>[\s\S]*?)\|(?<subtext>[^|\n]*)\}\})\s*$/;
  static readonly delimiter = /^(?<del>\.\.\.)\s*$/;
  static readonly comment = /^(?<cmt>#\s*(?<text>.*))$/;
  static readonly rightAlign = /^>\s*(?<names>[^\n]+?)\s*$/gm;
  static readonly centerAlign = /^\^\s*(?<names>[^\n]+?)\s*$/gm;
  static readonly node = new RegExp([this.message.source, this.delimiter.source, this.comment.source].join("|"), "gm");
}

export async function chatHandler(plugin: Plugin, src: string, el: HTMLElement, ctx: Context) {
  const right = collectNames(src, Patterns.rightAlign);
  const center = collectNames(src, Patterns.centerAlign);
  const nodes: ChatNode[] = [];
  let side: "left" | "right" | "center" = "left";
  for (const match of src.matchAll(Patterns.node)) {
    const groups = match.groups!;
    if (groups.msg !== undefined) {
      const header = fmt(groups.header);
      side = header.length > 0 ? (right.has(header) ? "right" : center.has(header) ? "center" : "left") : side;
      nodes.push(<ChatMessage>{kind: "message", side, header, body: fmt(groups.body), subtext: fmt(groups.subtext)});
    } else if (groups.del !== undefined) {
      nodes.push(<ChatDelimiter>{kind: "delimiter"});
    } else if (groups.cmt !== undefined) {
      nodes.push(<ChatComment>{kind: "comment", body: groups.text ?? ""});
    }
  }
  await renderChat(plugin.app, nodes, el, ctx);
}

function collectNames(src: string, pattern: RegExp): Set<string> {
  const out = new Set<string>();
  for (const m of src.matchAll(pattern)) {
    for (const name of (m.groups!.names ?? "").split(",")) {
      const trimmed = name.trim();
      if (trimmed.length > 0) out.add(trimmed);
    }
  }
  return out;
}

function fmt(str: string | undefined): string {
  return (str ?? "").trim().replace(/\\\|/g, "|");
}
