import {MarkdownPostProcessorContext} from "obsidian";

export type Context = MarkdownPostProcessorContext;

export type ChatMessage = {
  readonly kind: "message";
  readonly side: "left" | "right" | "center";
  readonly header: string;
  readonly body: string;
  readonly subtext: string;
};

export type ChatComment = {
  readonly kind: "comment";
  readonly body: string;
};

export type ChatDelimiter = {
  readonly kind: "delimiter";
};

export type ChatNode = ChatMessage | ChatComment | ChatDelimiter;