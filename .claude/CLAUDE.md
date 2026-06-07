# About Obsidian Chat View

Obsidian Chat View is an Obsidian plugin that enables users to create elegant chat views in their markdown files using multiple formats. The default format is called `chat`. However, users can define chats using other formats such as WebVTT, Transcripts etc.

Currently, the old version (1.6.0) is live on Obsidian. This project is the remake - Version 2.0.0. It is a full rewrite of the original with proper file separation, introducing the new chat format `{{header|body|subtext}}` with metadata-driven alignment (`> Names` for right, `^ Names` for center, default left), multi-line bodies, and continuation via empty header.

# New `chat` Format — Key Spec

- Messages: always 3 segments `{{header|body|subtext}}`. Any segment can be empty.
- Metadata lines (anywhere in the block): `> Name1, Name2` (right), `^ Name3, Name4` (center).
- Empty header → continuation (inherits previous message's side).
- `...` → delimiter. `# text` → comment. Pipe escaped as `\|`.

# Resources

1. The existing project is at: https://github.com/adifyr/obsidian-chat-view. It is also there on the `master` branch of this repo.
2. The issues for the project are at: https://github.com/adifyr/obsidian-chat-view/issues.
3. The README.md still describes the old project - so you can use that as a reference.
4. AGENTS.md file giving you the rundown on how to build Obsidian Plugins.

# Processors Built (all in `src/processors/`)

- `chat.ts` — new default format (see spec above).
- `chat-old.ts` — v1.6.0 line-based format: `>Alice|body|subtext`, `<`, `^` direction markers, `#` comments, `...` delimiter.
- `chat-webvtt.ts` — spec-compliant WebVTT parser. `Self: Names` header metadata for right-align. NOTE blocks → ChatComment. No styling metadata.
- `chat-zendesk.ts` — renamed from old `chat-transcript`. `[ts] Speaker: body` / `(ts) Speaker: body`. `> Names` for right-align. `***text***` for comments. Unmatched lines → fallback ChatComment.
- `chat-intercom.ts` — new format per issue #38. `HH:MM AM/PM | Speaker: body`. Multi-line via indented/blank continuation. `> Names` for right-align (same convention as zendesk/webvtt; added 2026-05-31). `--- text ---` → ChatComment. `---` → ChatDelimiter.

# Shared Infrastructure

- `src/renderer.ts` — shared `renderChat()`. Auto-assigns per-speaker header colors (cycles through 8 Obsidian CSS vars). Used by all processors.
- `src/types.ts` — `ChatMessage`, `ChatComment`, `ChatDelimiter` (note: you renamed `ChatDelimeter` → `ChatDelimiter` and `"delimeter"` → `"delimiter"` — verify this is consistent across all files before next session).

# TODO

- [x] Build the new `chat` format.
- [x] Port `chat-old` from v1.6.0.
- [x] Build `chat-webvtt`.
- [x] Build `chat-zendesk` (was `chat-transcript`).
- [x] Build `chat-intercom` (issue #38).
- [x] Verify `ChatDelimiter` / `"delimiter"` spelling is consistent across ALL files — confirmed clean.
- [x] Issue #32 — wontfix. Obsidian's deferred rendering pipeline invokes the processor only when the block nears the viewport. Not controllable from plugin side.
- [x] Issue #33 — documented `\|` pipe escaping in README, VERIFIED 2026-05-29. The `chat` body regex (`[\s\S]*?`) allows pipes; `fmt()` converts `\|`→`|` before `MarkdownRenderer`, so `[[note\|alias]]` renders as a proper aliased wikilink (confirmed live: clean target path, no leaked backslash). Caveat: header/subtext segments use `[^|\n]*` and split on any pipe regardless of escaping — but renderer.ts renders those as plain `text:` anyway, so wikilinks only render in the body. No parser fix needed.
- [x] Issue #30 — wontfix/no new processor. Researched 2026-05-29: Teams meeting transcripts download as `.vtt` (WebVTT) → already handled by `chat-webvtt`. The `[HH:MM AM/PM] Speaker` chat copy/paste format from the issue is legacy — MS removed author+timestamp from copy/paste in Aug 2024. README notes Teams→`chat-webvtt`.
- [x] Update README.md — fully rewritten for v2.0.0: all formats, migration table, shared conventions. NOTE: full rewrite not yet reviewed by user.
- [x] Issue #37 — wontfix. VERIFIED 2026-05-29 via live Graph View + `app.metadataCache.resolvedLinks`/`unresolvedLinks` (test note `test-chat-graph-view.md`, images in `test-assets/`). Finding: Obsidian indexes `[[wikilinks]]` inside a ```chat``` code block (registered in resolvedLinks) but does NOT index `![[embeds]]` inside a code block — the embed is absent from both resolved AND unresolved links (so not a path issue). Embed outside a block registers fine. Our `MarkdownRenderer.render` makes the image DISPLAY but does not feed the metadata cache; no supported plugin API to inject into resolvedLinks. So Graph View cannot show in-block image embeds. Earlier "likely fixed by MarkdownRenderer.render" hypothesis was wrong.
- [ ] Issue #40 — "Agent Chats" feature request. OPEN, awaiting more info from reporter. Researched 2026-05-29: no native paste-able transcript format exists for ChatGPT/Claude — native exports are full-account JSON dumps; per-conversation Markdown only via 3rd-party extensions. Considered a `SKILL.md` that has the AI emit the `{{header|body|subtext}}` format into an artifact for copy-paste, but REJECTED: the AI reconstructs from its context window (not a verbatim/true transcription), which defeats the reporter's "archive verbatim" goal. Faithful paths (per-provider JSON converter, or DOM-scraper exporter) are out of scope for the plugin. Plugin's only natural role would be rendering (user=bubble, agent=full-width doc), but that needs the input-format decision settled first. Holding for reporter clarification.