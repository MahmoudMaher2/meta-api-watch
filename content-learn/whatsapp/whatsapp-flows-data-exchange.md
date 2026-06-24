---
title: WhatsApp Flows Data Exchange Endpoint
date: 2026-06-24
category: whatsapp
description: Security and technical requirements for implementing the WhatsApp Flows Data Exchange Endpoint.
tags: [flows, data-exchange, encryption, timeout, validation]
---

# WhatsApp Flows Data Exchange Endpoint

Implementing a secure and performant WhatsApp Flows data exchange endpoint requires strict adherence to Meta's encryption protocols and timeout limits.

## Endpoint Encryption & Decryption

WhatsApp Flows use an end-to-end encrypted channel.
- **Protocol**: You must implement the WhatsApp Business Encryption protocol using **RSA** for key exchange and **AES-GCM** for payload encryption.
- **Key Management**: Generate a 2048-bit RSA key pair. Upload the public key to your WABA and securely store the private key.
- **Workflow**: Decrypt the `encrypted_aes_key` using your RSA private key, then use the AES key and IV to decrypt `encrypted_flow_data`. Your response must be encrypted with the same AES key and an inverted IV.

## Max Payload Sizes

While there is no strict byte limit documented, keeping payloads minimal is highly recommended. 
- Avoid large data blobs like base64-encoded images.
- Only include the specific data required for the Flow's logic to maintain low latency.

## Timeout Validations

Your data exchange endpoint must process and return a response within **10 seconds**.
- If the server takes longer, the request times out, resulting in a "Failed to fetch response" error for the user.
- Ensure you perform heavy processing asynchronously and optimize database queries.

## Endpoint Validations

<!-- preview -->
✅ Valid: The endpoint responds with a 200 OK and a lean, encrypted JSON payload within 2 seconds.
❌ Invalid: The endpoint includes a 5MB base64 image in the payload and takes 12 seconds to process, causing a timeout error on the WhatsApp client.

<!-- preview -->
✅ Valid: The endpoint implements proper error handling and returns a specific, mapped error screen state if a requested account ID is not found.
❌ Invalid: The endpoint relies on HTTP 500 errors without encrypted fallback payloads when validation fails.
