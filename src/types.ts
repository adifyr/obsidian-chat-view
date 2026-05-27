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

export type ChatDelimeter = {
  readonly kind: "delimeter";
};

export type ChatNode = ChatMessage | ChatComment | ChatDelimeter;