# Baileys Dev Transport

This folder is copied in spirit from the existing local `whatsapp-baileys-transport` project and reduced for Nuskha Care.

It is for internal testing only.

Production Nuskha Care should use the WhatsApp Business API through AiSensy or Gupshup. Baileys is useful during the first prototype stage because it lets the team test WhatsApp-like intake before WABA approval is complete.

## What It Does

- Opens a WhatsApp Web session using Baileys.
- Writes a QR image to local runtime storage.
- Listens for fresh direct messages.
- Normalizes text and image/document metadata.
- Forwards a compact event to a local Nuskha webhook.

It does not make medical decisions.

## Commands

Install dependencies from the repository root:

```bash
npm install
```

Create or refresh a login session:

```bash
npm run dev:baileys:login -- nuskha-dev --stay-alive
```

Run the local bridge:

```bash
NUSKHA_LOCAL_WEBHOOK_URL=http://127.0.0.1:8787/dev/whatsapp-inbound npm run dev:baileys:bridge -- nuskha-dev
```

On Windows PowerShell:

```powershell
$env:NUSKHA_LOCAL_WEBHOOK_URL="http://127.0.0.1:8787/dev/whatsapp-inbound"
npm run dev:baileys:bridge -- nuskha-dev
```

## Runtime Files

Runtime files are written under:

```text
.runtime/baileys-auth/profiles/<profile>
```

Do not commit that folder. It contains WhatsApp session credentials.

## Safety Boundary

Use this transport only for synthetic tests, founder-device experiments, and pre-WABA demos.

Do not use it for production patient workflows.

