# About Obsidian Chat View

Obsidian Chat View is an Obsidian plugin that enables users to create elegant chat views in their markdown files using multiple formats. The default format is called `chat`. However, users can define chats using other formats such as WebVTT, Transacripts etc.

Currently, the old version (1.6.0) is live on Obsidian. This project is the remake - Version 2.0.0. It is a full rewrite of the original with proper file separation, introducing the new chat format: `<{{ header | body | subtext }}` which supports multi-line bodies and addition of long requested formats such as Microsoft Teams.

# Resources

1. The existing project is at: https://github.com/adifyr/obsidian-chat-view. It is also there on the `master` branch of this repo.
2. The issues for the project are at: https://github.com/adifyr/obsidian-chat-view/issues.
3. The README.md still describes the old project - so you can use that as a reference.
4. AGENTS.md file giving you the rundown on how to build Obsidian Plugins.

# TODO

- [x] Build the new `chat` format.
- [ ] Port over the existing formats (including the old chat format, which will now be called `chat-old`) from Version 1.6.0 - this time, in separate files inside `processors/`.
- [ ] Address issues from the GitHub repository.
- [ ] Build the new formats requested in some of the issues.