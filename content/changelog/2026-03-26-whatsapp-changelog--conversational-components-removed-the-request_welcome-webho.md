---
title: , *Conversational Components*  Removed the `request_welcome` webhook and welcome message f
date: 2026-03-26
source_slug: whatsapp-changelog
source_name: WhatsApp Business Platform Changelog
source_url: https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog
category: Deprecation
sv2_modules: [Webhooks]
summary_short: , *Conversational Components*  Removed the request_welcome webhook and welcome message feature from conversational components. This feature 
audit_corrections: backfill (historical entry, not diff-detected)
---

## Summary

, *Conversational Components*  Removed the request_welcome webhook and welcome message feature from conversational components. This feature is no longer supported. The enable_welcome_message parameter has been removed from the Conversational Automation API.

## Why it Matters for SV2

Check whether SEEN V2 relies on the deprecated feature. Plan migration before end-of-life.

## Suggested QA Action

Audit usage of deprecated API/feature in SEEN V2 codebase.

## Source Details

- **Source**: [WhatsApp Business Platform Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- **Original date**: March 27, 2026
- **Tags**: Cloud API

---
*Backfilled from snapshot on 2026-06-24.*
