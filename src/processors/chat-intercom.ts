import {Plugin} from "obsidian";
import {renderChat} from "../renderer";
import {ChatComment, ChatDelimiter, ChatMessage, ChatNode, Context} from "../types";

abstract class Patterns {
  static readonly message = /^(?<ts>\d{1,2}:\d{2}\s+[AP]M)\s*\|\s*(?<rest>.+?)\s*$/;
  static readonly date = /^---\s*(?<text>.+?)\s*---\s*$/;
  static readonly delimiter = /^---\s*$/;
  static readonly align = /^>\s*(?<names>.+?)\s*$/;
  static readonly indented = /^\s/;
}

type Active = {ts: string; header: string; body: string};

export async function chatIntercomHandler(plugin: Plugin, src: string, el: HTMLElement, ctx: Context) {
  const lines = src.split("\n");
  const rightAlign = new Set<string>();
  for (const line of lines) {
    const m = line.match(Patterns.align);
    if (m) {
      for (const name of (m.groups!.names ?? "").split(",")) {
        const trimmed = name.trim();
        if (trimmed.length > 0) rightAlign.add(trimmed);
      }
    }
  }

  const nodes: ChatNode[] = [];
  let current: Active | null = null;
  let fallback: string[] = [];

  const flushMessage = () => {
    if (current !== null) {
      nodes.push(<ChatMessage>{
        kind: "message",
        side: rightAlign.has(current.header) ? "right" : "left",
        header: current.header,
        body: current.body.trimEnd(),
        subtext: current.ts,
      });
      current = null;
    }
  };
  const flushFallback = () => {
    if (fallback.length > 0) {
      const body = fallback.join("\n").trim();
      if (body.length > 0) nodes.push(<ChatComment>{kind: "comment", body});
      fallback = [];
    }
  };
  const flush = () => {
    flushMessage();
    flushFallback();
  };

  for (const line of lines) {
    const msgMatch = line.match(Patterns.message);
    const dateMatch = line.match(Patterns.date);
    const isDelimiter = Patterns.delimiter.test(line);
    const isAlign = Patterns.align.test(line);
    const isBlank = line.trim().length === 0;
    const isIndented = Patterns.indented.test(line);

    if (msgMatch) {
      flush();
      const ts = (msgMatch.groups!.ts ?? "").trim();
      const rest = msgMatch.groups!.rest ?? "";
      const colonIdx = rest.indexOf(":");
      const header = colonIdx === -1 ? "" : rest.slice(0, colonIdx).trim();
      const body = colonIdx === -1 ? rest.trim() : rest.slice(colonIdx + 1).trim();
      current = {ts, header, body};
    } else if (dateMatch) {
      flush();
      nodes.push(<ChatComment>{kind: "comment", body: (dateMatch.groups!.text ?? "").trim()});
    } else if (isDelimiter) {
      flush();
      nodes.push(<ChatDelimiter>{kind: "delimiter"});
    } else if (isAlign) {
      // Alignment metadata (collected in the pre-pass); not rendered.
    } else if (current !== null && (isBlank || isIndented)) {
      current.body += "\n" + line;
    } else if (isBlank) {
      if (fallback.length > 0) fallback.push(line);
    } else {
      flushMessage();
      fallback.push(line);
    }
  }
  flush();

  await renderChat(plugin.app, nodes, el, ctx);
}
