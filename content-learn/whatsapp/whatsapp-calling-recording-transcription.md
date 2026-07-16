---
title: "WhatsApp Cloud API Calling: Call Recording & Call Transcription"
date: "2026-07-16"
category: "whatsapp"
description: "How to configure and use Call Recording and Call Transcription for the WhatsApp Business Calling API. Includes details on user consent requirements and payload schemas."
tags: ["whatsapp", "calling-api", "recording", "transcription", "cloud-api", "new-feature"]
badge: "NEW"
---

# WhatsApp Calling: Call Recording & Transcription 🆕

Meta has added official guides and support for **Call Recording** and **Call Transcription** to the **WhatsApp Business Calling API** (introduced in June 2026). Both features are designed to help businesses record calling interactions and programmatically transcribe the spoken audio to text.

> ⚠️ **Important Consent Policy:** You must play a customer announcement notifying the user that the call is being recorded and/or transcribed before starting the recording. This announcement must comply with local privacy regulations.

---

## 1. Call Recording

Call Recording is available for both **business-initiated** and **user-initiated** calls.

### How it Works
- The business triggers the recording process during an active calling session.
- Once the call is ended, the recorded calling audio is saved and made available for download.
- Recorded audio files are delivered to your media storage or webhook as inbound audio content.

---

## 2. Call Transcription

Call Transcription allows converting the recorded call audio to text programmatically.

### Key Features
- Converts the audio stream from both caller and receiver channels into readable text transcripts.
- Supports both business-initiated and user-initiated calls.
- Helps in automating customer support auditing, training, and QA checks.

---

## Configuration & Usage Comparison

<!-- panel:comparison -->
**Call Recording**
- Saves call audio as a downloadable media file.
- Works on both incoming and outgoing calls.
- Requires compliance with user announcement rules.

**Call Transcription**
- Converts recorded voice calling audio into text transcripts.
- Useful for archiving and training models.
- Can be used alongside call recording pipelines.
<!-- endpanel -->

---

## Quick Quiz

<!-- panel:quiz -->
Before starting call recording or transcription, what action is legally and policy-wise required?
- [ ] No action is required
- [ ] Sending a text message confirmation to the user
- [x] Playing an audio customer announcement notifying them of recording/transcription
- [ ] Submitting a request to Meta for approval per call
<!-- endpanel -->
