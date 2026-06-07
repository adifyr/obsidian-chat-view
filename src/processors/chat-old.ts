import {Plugin} from "obsidian";
import {renderChat} from "../renderer";
import {ChatComment, ChatDelimiter, ChatMessage, ChatNode, Context} from "../types";

abstract class Patterns {
  static readonly message = /^(?<msg>(?<dir>[<>^])(?<rest>.+?))\s*$/;
  static readonly delimiter = /^(?<del>\.\.\.)\s*$/;
  static readonly comment = /^(?<cmt>#\s*(?<text>.*?))\s*$/;
  static readonly node = new RegExp([this.message.source, this.delimiter.source, this.comment.source].join("|"), "gm");
  static readonly sides = {">": "right", "<": "left", "^": "center"};
}

export async function chatOldHandler(plugin: Plugin, src: string, el: HTMLElement, ctx: Context) {
  const nodes: ChatNode[] = [];
  for (const match of src.matchAll(Patterns.node)) {
    const groups = match.groups!;
    if (groups.msg !== undefined) {
      const parts = (groups.rest ?? "").replaceAll("\\|", "\x00").split("|").map((p) => {
        return p.replaceAll("\x00", "|").trim();
      });
      const header = parts.length > 1 ? parts[0] : "";
      const body = parts.length > 1 ? parts[1] : parts[0];
      const subtext = parts.length > 2 ? parts[2] : "";
      const side = Patterns.sides[groups.dir as keyof typeof Patterns.sides];
      nodes.push(<ChatMessage>{kind: "message", side, header, body, subtext, });
    } else if (groups.del !== undefined) {
      nodes.push(<ChatDelimiter>{kind: "delimiter"});
    } else if (groups.cmt !== undefined) {
      nodes.push(<ChatComment>{kind: "comment", body: groups.text ?? ""});
    }
  }
  await renderChat(plugin.app, nodes, el, ctx);
}
