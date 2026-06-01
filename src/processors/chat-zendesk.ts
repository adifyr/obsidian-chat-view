import {Plugin} from "obsidian";
import {renderChat} from "../renderer";
import {ChatComment, ChatDelimiter, ChatMessage, ChatNode, Context} from "../types";

abstract class Patterns {
  static readonly message = /^(?<msg>[[(](?<ts>.+?)[\])]\s*(?<rest>.+?))\s*$/;
  static readonly delimiter = /^(?<del>\.\.\.)\s*$/;
  static readonly comment = /^(?<cmt>\*\*\*\s*(?<text>.+?)\s*\*\*\*)\s*$/;
  static readonly align = /^(?<aln>>\s*(?<names>.+?))\s*$/gm;
  static readonly fallback = /^(?<fall>.+?)\s*$/;
  static readonly node = new RegExp(
    [this.message.source, this.delimiter.source, this.comment.source, this.align.source, this.fallback.source].join("|"),
    "gm",
  );
}

export async function chatZendeskHandler(plugin: Plugin, src: string, el: HTMLElement, ctx: Context) {
  const rightAlign = new Set<string>();
  for (const m of src.matchAll(Patterns.align)) {
    for (const name of (m.groups!.names ?? "").split(",")) {
      const trimmed = name.trim();
      if (trimmed.length > 0) rightAlign.add(trimmed);
    }
  }
  const nodes: ChatNode[] = [];
  for (const match of src.matchAll(Patterns.node)) {
    const groups = match.groups!;
    if (groups.msg !== undefined) {
      const rest = groups.rest ?? "";
      const colonIdx = rest.indexOf(":");
      const header = colonIdx === -1 ? "" : rest.slice(0, colonIdx).trim();
      const body = colonIdx === -1 ? rest.trim() : rest.slice(colonIdx + 1).trim();
      const subtext = (groups.ts ?? "").trim();
      const side = rightAlign.has(header) ? "right" : "left";
      nodes.push(<ChatMessage>{kind: "message", side, header, body, subtext});
    } else if (groups.del !== undefined) {
      nodes.push(<ChatDelimiter>{kind: "delimiter"});
    } else if (groups.cmt !== undefined) {
      nodes.push(<ChatComment>{kind: "comment", body: groups.text ?? ""});
    } else if (groups.fall !== undefined) {
      const text = groups.fall.trim();
      if (text.length > 0) nodes.push(<ChatComment>{kind: "comment", body: text});
    }
  }
  await renderChat(plugin.app, nodes, el, ctx);
}
