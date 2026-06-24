---
title: "Messenger Persistent Menu Limits & Best Practices"
date: "2026-06-24"
category: "messenger"
description: "Guidelines and technical limitations for the Messenger persistent menu, including max items and character limits."
tags: ["messenger", "persistent-menu", "ui-limits"]
---

# Messenger Persistent Menu Limits & Best Practices

The Persistent Menu in Messenger is an always-accessible UI element that helps users discover and access the core functionality of your bot without having to remember specific text commands. 

## UI Limitations and Validations

Meta enforces strict structural and text validations on the persistent menu. It is crucial to respect these limits to successfully update your bot's profile.

### Maximum Items and Sub-levels
- **Top-Level Items**: You are allowed a maximum of **3** items at the root level of the menu.
- **Sub-Levels**: Menus can be nested up to **3 levels deep**.
- **Submenu Capacity**: Each submenu can hold up to **5** items.

### Character Limits
- **Title Length**: Each menu item's title is strictly limited to **30 characters**. This limit includes spaces and punctuation. Keep in mind that some emojis may count as 2 characters.

### Disabled Composer State
You have the option to disable the user's text composer (`composer_input_disabled: true`) when the persistent menu is active. This forces the user to rely entirely on the menu or quick replies to interact with the bot, which can be useful for highly structured, menu-driven experiences. When disabled, the UI will hide the text input field, showing only the menu icon.

## Examples

<!-- preview -->
✅ Valid: A persistent menu with 3 top-level items, where one item opens a submenu containing 4 items.
❌ Invalid: A persistent menu with 4 top-level items. (The API will reject the update).

<!-- preview -->
✅ Valid: A menu item titled "Customer Support" (16 characters).
❌ Invalid: A menu item titled "Contact Our Customer Support Team Now" (37 characters - Exceeds the 30 character limit).
