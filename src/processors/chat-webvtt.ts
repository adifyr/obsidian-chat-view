import {Plugin} from "obsidian";
import {renderChat} from "../renderer";
import {ChatComment, ChatMessage, ChatNode, Context} from "../types";

type ParsedItem = {
  readonly kind: "cue";
  readonly start: number;
  readonly end: number;
  readonly speaker: string;
  readonly text: string;
} | {
  readonly kind: "note";
  readonly body: string;
};

abstract class Patterns {
  static readonly signature = /^WEBVTT(\s|$)/;
  static readonly timing = /^(?:\d{2}:)?\d{2}:\d{2}\.\d{3}\s+-->\s+(?:\d{2}:)?\d{2}:\d{2}\.\d{3}/;
  static readonly meta = /^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/;
  static readonly voice = /^<v(?:\.[^\s>]+)*\s+([^>]+?)>([\s\S]*)$/;
}

function parseTimestamp(ts: string): number {
  const parts = ts.split(":");
  const h = parts.length === 3 ? parseInt(parts[0]!, 10) : 0;
  const m = parseInt(parts[parts.length - 2]!, 10);
  const s = parseFloat(parts[parts.length - 1]!);
  return Math.round((h * 3600 + m * 60 + s) * 1000);
}

function formatTimestamp(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  const milli = ms % 1000;
  const pad = (n: number, w = 2) => n.toString().padStart(w, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(milli, 3)}`;
}

function parseVtt(src: string): {meta: Map<string, string>; items: ParsedItem[]} {
  const stripped = src.charCodeAt(0) === 0xFEFF ? src.slice(1) : src;
  const normalized = stripped.replace(/\r\n?/g, "\n");
  const lines = normalized.split("\n");
  const meta = new Map<string, string>();
  const items: ParsedItem[] = [];
  if (lines.length === 0 || !Patterns.signature.test(lines[0]!)) {
    return {meta, items};
  }
  let i = 1;
  while (i < lines.length && lines[i]!.trim().length > 0) {
    const m = lines[i]!.match(Patterns.meta);
    if (m) meta.set(m[1]!, m[2]!.trim());
    i++;
  }
  while (i < lines.length) {
    while (i < lines.length && lines[i]!.trim().length === 0) i++;
    if (i >= lines.length) break;
    const blockStart = i;
    while (i < lines.length && lines[i]!.trim().length > 0) i++;
    const block = lines.slice(blockStart, i);
    const first = block[0]!.trim();
    if (first === "NOTE" || first.startsWith("NOTE ")) {
      const firstRest = first === "NOTE" ? "" : first.slice(5);
      const body = [firstRest, ...block.slice(1)].join("\n").trim();
      items.push({kind: "note", body});
      continue;
    }
    if (first === "STYLE" || first === "REGION") continue;
    const timingIdx = Patterns.timing.test(block[0]!) ? 0 : 1;
    if (timingIdx >= block.length || !Patterns.timing.test(block[timingIdx]!)) continue;
    const timingLine = block[timingIdx]!;
    const arrowIdx = timingLine.indexOf("-->");
    const startStr = timingLine.slice(0, arrowIdx).trim();
    const endStr = timingLine.slice(arrowIdx + 3).trim().split(/\s+/)[0]!;
    const start = parseTimestamp(startStr);
    const end = parseTimestamp(endStr);
    const payload = block.slice(timingIdx + 1).join("\n").trim();
    const voiceMatch = payload.match(Patterns.voice);
    let speaker = "";
    let text = payload;
    if (voiceMatch) {
      speaker = voiceMatch[1]!.trim();
      text = voiceMatch[2]!;
      if (text.endsWith("</v>")) text = text.slice(0, -4);
      text = text.trim();
    }
    items.push({kind: "cue", start, end, speaker, text});
  }
  return {meta, items};
}

export async function chatWebvttHandler(plugin: Plugin, src: string, el: HTMLElement, ctx: Context) {
  const {meta, items} = parseVtt(src);
  const self = meta.get("Self") ?? "";
  const selves = new Set(self.split(",").map((s) => s.trim()).filter((s) => s.length > 0));
  const nodes: ChatNode[] = items.map((item) => {
    if (item.kind === "note") return <ChatComment>{kind: "comment", body: item.body};
    return <ChatMessage>{
      kind: "message",
      side: selves.has(item.speaker) ? "right" : "left",
      header: item.speaker,
      body: item.text,
      subtext: `${formatTimestamp(item.start)} to ${formatTimestamp(item.end)}`,
    };
  });
  await renderChat(plugin.app, nodes, el, ctx);
}
