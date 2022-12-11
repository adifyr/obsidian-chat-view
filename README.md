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
    You can also change the color of headers speaker-wise. You may choose from upto 13 colors: `[red, green, blue, yellow, orange, purple, grey, brown, indigo, teal, pink, slate, wood]`. This can be done by adding a color configuration like this to your code block: `[Person Name=color, Person Name=color]`.

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

## WebVTT Support!

As of Version 1.2.0, Obsidian Chat View now supports the WebVTT format! Instead of the regular `chat` header, give your code block the name `chat-webvtt`. Then paste your WebVTT code in there! There are a few things to keep in mind:

1. Please ensure that you are correctly following the WebVTT format. Make sure your code starts with `WEBVTT` on the first line.
2. You can customize the Chat View by using metadata. **There should be no empty line between the `WEBVTT` and your metadata.**
3. You may set the `Self` parameter in your metadata to a comma-separated list of names. All chat bubbles from the aforementioned names will appear on the right hand side as opposed to the default, which is left, to indicate that the specified persons' chats are in First-Person.
4. The plugin only recognizes voice tags (`<v></v>`) in a cue's body. Anything else will be treated as regular text.

Following is an example of a Chat View generated by WebVTT code.

~~~
```chat-webvtt
WEBVTT
Self: John Smith, fjorn@gmail.com
MaxWidth: 70
Header: h3

00:00:00.000 --> 00:01:04.270
<v John Smith>No one touch it, it just works. It is the definition of an absolutely perfect Chat View. Do not defile it! Or else...</v>

00:00:05.790 --> 00:00:06.930
<v John Smith>Going forward, obviously.</v>

00:00:04.310 --> 00:00:04.940
<v Bob Anderson>Uhm?</v>

00:00:04.310 --> 00:00:04.940
<v fjorn@gmail.com>Uhm - would be correct! I have no idea what John is talking about!</v>
```
~~~

The above code will generate the following Chat View:

![Chat View WebVTT Preview](https://github.com/adifyr/obsidian-chat-view/raw/master/images/chatview_preview_webvtt.jpg)

## Minimal Mode

As of the release of Version 1.2.0, the Chat View plugin now supports minimal mode. You can enable minimal mode by adding the following to the config line of your code block: `{..., mode=minimal}`. This will generate a Chat View with no bubbles and condensed spacing making it look more like a forum thread. The following example shows minimal mode in action:

~~~
```chat
{mw=90,mode=minimal}
[Albus Dumbledore=teal, Minerva McGonagall=pink]

< Albus Dumbledore | I should've known you would have been around Professor McGonagall. Couldn't resist seeing the boy after all, could you? | 25th April 1982 at 2:06 AM
< Minerva McGonagall | Good evening Professor Dumbledore. Tell me, are the rumors really true? | 25th April 1982 at 2:07 AM
< Albus Dumbledore | I'm afraid they are professor. Both, the good and the bad. Hagrid is bringing the boy as we speak. | 25th April 1982 at 2:08 AM
```
~~~

The code block above will generate the following Chat View:

![Chat View Minimal Mode](https://github.com/adifyr/obsidian-chat-view/raw/master/images/chatview_preview_minimal.jpg)

## Markdown & HTML Support In Chat View Message

Following the release of Version 1.3.0 of the Chat View Plugin, the message section of the Chat View now supports HTML and Markdown rendering! Which means you can now include HTML and Markdown elements in your Chat View Message! **Take a look:**

![Chat View Markdown & HTML Support](https://github.com/adifyr/obsidian-chat-view/blob/master/images/chatview_preview_md_html.gif)

The above Chat View was generated from the following Code Block:

~~~
```chat
[Brian Williams=pink, Stacy Adams=orange]
{mw=80}
< Brian Williams | <h6>Pier Trip Suggestions</h6> Hi Stacy, I'm planning to go on a trip to a pier in the state! So, I wanted to ask if you had any suggestions. I have a couple of pre-conditions though: <ul><li>It needs to be a beautiful spot. [So that I can take loads of pics!](https://theculturetrip.com/north-america/usa/california/articles/the-coolest-piers-in-california-from-santa-monica-to-santa-barbara/)</li><li>It needs to be affordable. [This one's kinda expensive.](https://www.tripadvisor.in/Attraction_Review-g60713-d102779-Reviews-Pier_39-San_Francisco_California.html)</li></ul> **So, can you please help me out?** I'll be sure to send over a souvenir. Thanks! | Yesterday at 5:45 PM
> Stacy Adams | ![Santa Monica Pier](https://images.hdqwalls.com/wallpapers/santa-monica-ferris-wheel-colorful-golden-hour-hz.jpg) <h6>How About Santa Monica?</h6> Jutting out into the Pacific Ocean at the intersection of Ocean and Colorado, it symbolizes the *Heart of Santa Monica* and is one of the most photographed locations in the world. It also has affordable rentals and accomodation! | Today at 10:30 AM
```
~~~

### ⚠️ Important
Markdown Syntax that covers a full line, such as headers (#), Lists (-), Line Breaks (---) etc. will end up rendering the entire Chat View Message in that format. For such cases, it is recommended to use HTML Tags instead, as has been used in the example above. 

---

## Chat Transcripts (Zendesk, Customer Support, CRMs) Support!

As of Version 1.4.0, Obsidian Chat View now includes a new mode that enables the rendering of Chat Transcripts from Customer Support Platforms such as Zendesk and other CRMs. To use Transcript Mode simply give your code-block the name of `chat-transcript`. Below is an example of the Chat Transcripts format:

```
(1:38:05 PM) *** Firstname Lastname has joined the chat ***
(1:38:39 PM) Firstname Lastname: This is the chat-text followed after the time and name.
(1:40:26 PM) Other-Firstname Other-Lastname: Sure thanks!
(2:21:29 PM) *** Firstname Lastname has left ***
```

However, in the plugin, Transcript Mode includes all the same styling & formatting features as other chat modes. It even has delimiters There are a few additions however:

1. The `>` character is now used in the beginning of the code-block to specify which participants should have their Chat View blocks aligned on the left side.
2. Chat Transcripts supports both `()` and `[]` for its timestamps.
3. Two kinds of comment formats are allowed in the plugin:
    a. `(2:21:29 PM) *** Firstname Lastname has left ***` - One with the timestamp and the three stars: `***`
    b. Any line in the code block that doesn't follow a valid Transcript format (`[Timestamp] Name: Message`), it will also be treated as a comment.

All of this culminates into the kind of Chat View you can see below:

~~~
```chat-transcript
> Other-Firstname Other-Lastname
[Firstname Lastname=blue, Other-Firstname Other-Lastname=pink]
{header=h4, mw=80}

(1:38:05 PM) *** Firstname Lastname has joined the chat. ***
(1:38:39 PM) Firstname Lastname: This is the chat-text followed after the time and name.
...
[1:40:26 PM] Other-Firstname Other-Lastname: Sure thanks! It's nice to have been able to meet someone who could help me with this.
Firstname Lastname has left this chat.
```
~~~

The above code-block will render the following Chat View:

![Chat View With Transcripts Support](https://user-images.githubusercontent.com/86793553/206829253-6c4da4ff-3537-458d-ab45-c501d1f43262.png)

## Thank you for reading!

This project is published under the [MIT License](LICENSE).
