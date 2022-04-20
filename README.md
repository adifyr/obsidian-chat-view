# Obsidian Chat View Plugin
Chat View let's you quickly and easily create elegant Chat UIs in your Markdown Files.

![Obsidian Chat View Overview](https://github.com/adifyr/obsidian-chat-view/raw/master/images/obsidian_chatview_plugin.jpg)

## Usage

Every chat message must be prefixed with a `'<'`, `'>'` or `'^'` for left, right & center aligning the messages respectively. Each chat message consists of 3 parts: The header, message and the subtext. The parts are separated by a `'|'` character. Take a look at the example below to see how it works:
~~~
```chat
< Fitzwilliam Darcy | I've fought against my judgement, my family's expectations... The inferiority of your birth, my rank and circumstance. | 23rd July, 1846 at 5:42 PM
> Elizabeth Bennett | Now hold on, Mr. Darcy, I'm afraid I don't understand where you're going with this. | 23rd July, 1846 at 5:42 PM
```
~~~
The above code will generate the following Chat View:

![Chat View Preview 1](https://github.com/adifyr/obsidian-chat-view/raw/master/images/chatview_preview1.jpg)

## Add Delimiters & Comments
You can add delimiters to your chat view simply by entering `'...'` on a line. To add a comment, start a line with the `'#'` character. Take a look at the following example:

~~~
```chat
< Fitzwilliam Darcy | Just listen to me, all right? You simply cannot fathom the amount of courage I've had to muster to say this.
# Lizzie gazed at Darcy with a baffled look on her face. Darcy was now sweating profusely. This only unsettled her even more. What was happening?
> Elizabeth Bennett | Mr. Darcy, are you all right? Why did you come here?
...
< Fitzwilliam Darcy | I came here to tell you that I'm in love with you. I'm deeply, unabashedly, utterly in love with you.
```
~~~

The above code will generate the following Chat View:

![Chat View Preview 2](https://github.com/adifyr/obsidian-chat-view/raw/master/images/chatview_preview2.jpg)

As you may have noticed, I've actually left out the subtext from these messages. The Chat View plugin is flexible that way. You can also leave out the header if you like just by starting the message off with the `'|'` character. For example, the following code:

~~~
```chat
< Fitzwilliam Darcy | And I care not for the consequences of what I'm about to do.
< | Elizabeth Bennett, will you marry me? | 23rd July 1846, 5:51 PM
```
~~~

Will result in the Chat View seen below:

![Chat View Preview 3](https://github.com/adifyr/obsidian-chat-view/raw/master/images/chatview_preview3.jpg)

## Customization
To add that last bit of organization & pizazz, the plugin also includes the ability to customize the header size, header colors and maximum width of the chat bubbles. Here's how you can configure each of them for your Chat View:

- ### Header Size
    Chat View allows you to choose from 5 different sizes for your Chat Bubble's header: `[h2, h3, h4, h5, h6]`. This can be done by simply adding the following config line to your code block: `{header=<hX>}`.

- ### Header Color
    You can also change the color of headers speaker-wise. You may choose from upto 10 colors: `[red, green, blue, yellow, orange, purple, grey, brown, indigo, teal]`. This can be done by adding a color configuration like this to your code block: `[Person Name=color, Person Name=color]`.

- ### Max Width
    The maximum width of the Chat Bubble can be specified by adding the following to your config line: `{..., mw=width}`. The plugin accepts 9 widths (in percentages) from 50% to 90% at an interval of 5%. Namely: `[50, 55, 60, 65, 70, 75, 80, 85, 90]`.

The below example showcases how all three of these work in tandem.
~~~
```chat
{header=h3, mw=75}
[Elizabeth Bennett=blue, Fitzwilliam Darcy=yellow]

> Elizabeth Swann | I... But what about... You can't be serious, Mr. Darcy. This is preposterous. After all we've been through, I thought...
> | Yes. I will marry you. | 23rd July, 1846 at 6:02 PM.
# Darcy had no words left. They'd reached a point beyond all mannerisms, all formalities. All that was left was raw love. Only it could speak next.
< Fitzwilliam Darcy | I love you Lizzie. With all my heart. And I will do so for as long as we shall be together. | 23rd July, 1846 at 6:04 PM.
```
~~~

The above code will generate the following Chat View:

![Chat View Preview 4](https://github.com/adifyr/obsidian-chat-view/raw/master/images/chatview_preview4.jpg)

## Thank you for reading!

This project is published under the [MIT License](LICENSE).
