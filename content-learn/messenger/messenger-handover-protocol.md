---
title: "Messenger Handover Protocol & Thread Control"
date: "2026-06-24"
category: "messenger"
description: "How to manage thread control between bot and human agents using the Messenger Handover Protocol."
tags: ["messenger", "handover-protocol", "human-agent"]
---

# Messenger Handover Protocol & Thread Control

The Messenger Handover Protocol (now integrated into Conversation Routing) provides the technical infrastructure for businesses to seamlessly transfer conversations between automated bots and live human agents.

## Thread Control

Thread control dictates which app is allowed to send messages to the user at any given time.
- **Primary Receiver**: Usually the automated bot. It handles standard routing and basic inquiries.
- **Secondary Receiver**: Usually a human agent inbox (e.g., Facebook Page Inbox or a CRM tool). 
Only one receiver can possess thread control at a time, ensuring that bots and humans do not clash by sending conflicting messages simultaneously.

## UI Limitations and Validations

Unlike some other platforms, Meta's Handover Protocol is designed to be visually seamless. There are important UI considerations to keep in mind:

### UI Indicators for Human vs. Bot
The platform **does not** automatically insert native "Bot" or "Human Agent" badges or system messages into the user's UI when thread control changes hands. The transition is inherently invisible.

To create valid visual distinctions, developers must build custom indicators:
1. **Persona API**: You can dynamically change the sender's display name and profile picture. For instance, the bot might use the brand's logo, while a human agent uses a real photo and name.
2. **System Messages**: The bot should send a clear text message (e.g., *"Transferring you to a human agent..."*) right before passing thread control.

## Examples

<!-- preview -->
✅ Valid: Using the Persona API to change the avatar to a human face when thread control is passed to the Secondary Receiver.
❌ Invalid: Relying on Facebook to automatically inform the user that a human has joined the chat without sending any transition message.

<!-- preview -->
✅ Valid: Only the app that currently holds Thread Control sending a message to the user.
❌ Invalid: The Primary Receiver (Bot) attempting to send automated replies while the Secondary Receiver (Human) holds Thread Control. (The API will block the bot's messages).
