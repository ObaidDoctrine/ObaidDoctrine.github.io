# OBAID DOCTRINES — Premium TTS backend

This folder contains a secure server-side Text-to-Speech endpoint for the static GitHub Pages site.

## Why a backend is required

GitHub Pages is a static hosting service. The ElevenLabs API key must stay server-side and must never be placed in browser JavaScript.

## Cloudflare Worker setup

Create a Cloudflare Worker and deploy `worker.js`.

Set these Worker variables/secrets:

- `ELEVENLABS_API_KEY` — secret
- `ELEVENLABS_VOICE_ID` — the selected premium voice ID
- `ALLOWED_ORIGIN` — `https://obaiddoctrine.github.io`

The worker accepts:

`POST / `

JSON:

```json
{"text":"Article text here","language":"en"}
```

or:

```json
{"text":"مضمون کا متن یہاں","language":"ur"}
```

It returns MP3 audio.

## Voice requirement

Use one consistent male voice that has been tested for both English and Urdu. ElevenLabs recommends a voice trained on the target language/accent for best pronunciation. The site should not claim a voice is premium until it has been listened to and verified in both languages.

## Website connection

After the Worker has a real deployed URL, the website player can be switched from browser speech synthesis to this endpoint without exposing the ElevenLabs key.
