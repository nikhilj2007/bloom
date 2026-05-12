import { NextRequest, NextResponse } from "next/server";

// ─── Environment validation (runs once at module load) ────────────────────────

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM";

if (!ELEVENLABS_API_KEY) {
  console.error(
    "[TTS] FATAL: ELEVENLABS_API_KEY is not set in environment variables. " +
    "Add it to .env.local as: ELEVENLABS_API_KEY=sk_..."
  );
}

if (!VOICE_ID) {
  console.error(
    "[TTS] FATAL: ELEVENLABS_VOICE_ID is not set and the fallback is empty. " +
    "Add it to .env.local as: ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM"
  );
}

const ELEVENLABS_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── 1. Validate env vars ──────────────────────────────────────────────────
  if (!ELEVENLABS_API_KEY) {
    console.error("[TTS] Request rejected: ELEVENLABS_API_KEY missing.");
    return NextResponse.json(
      { error: "Server misconfiguration: ELEVENLABS_API_KEY is not set." },
      { status: 500 }
    );
  }

  // ── 2. Parse and validate the request body ────────────────────────────────
  let text: string;
  try {
    const body = await req.json();
    text = body?.text;
  } catch {
    console.error("[TTS] Failed to parse request body as JSON.");
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!text || typeof text !== "string" || !text.trim()) {
    console.error("[TTS] Request rejected: 'text' field is missing or empty.");
    return NextResponse.json(
      { error: "'text' is required and must be a non-empty string." },
      { status: 400 }
    );
  }

  // Trim to 500 chars to stay within ElevenLabs free-tier limits
  const trimmed = text.trim().slice(0, 500);

  // ── 3. Log the outgoing payload (key masked) ──────────────────────────────
  const maskedKey =
    ELEVENLABS_API_KEY.length > 8
      ? ELEVENLABS_API_KEY.slice(0, 4) + "..." + ELEVENLABS_API_KEY.slice(-4)
      : "***";

  console.log("[TTS] Sending request to ElevenLabs:", {
    url: ELEVENLABS_URL,
    voiceId: VOICE_ID,
    apiKeyPreview: maskedKey,
    textLength: trimmed.length,
    textPreview: trimmed.slice(0, 80) + (trimmed.length > 80 ? "…" : ""),
  });

  // ── 4. Call ElevenLabs API ────────────────────────────────────────────────
  let elevenRes: Response;
  try {
    elevenRes = await fetch(ELEVENLABS_URL, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: trimmed,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.75,
        },
      }),
    });
  } catch (fetchErr: unknown) {
    const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
    console.error("[TTS] Network error — could not reach ElevenLabs API:", msg);
    return NextResponse.json(
      { error: `Network error reaching ElevenLabs: ${msg}` },
      { status: 502 }
    );
  }

  // ── 5. Handle non-2xx responses from ElevenLabs ───────────────────────────
  if (!elevenRes.ok) {
    let rawBody = "";
    try {
      rawBody = await elevenRes.text();
    } catch {
      rawBody = "(could not read response body)";
    }

    console.error("[TTS] ElevenLabs returned an error:", {
      status: elevenRes.status,
      statusText: elevenRes.statusText,
      url: ELEVENLABS_URL,
      voiceId: VOICE_ID,
      body: rawBody,
    });

    // Forward a clear error to the frontend
    return NextResponse.json(
      {
        error: `ElevenLabs API error ${elevenRes.status} (${elevenRes.statusText}): ${rawBody}`,
      },
      { status: elevenRes.status >= 400 && elevenRes.status < 600 ? elevenRes.status : 502 }
    );
  }

  // ── 6. Stream audio back to client ────────────────────────────────────────
  let audioBuffer: ArrayBuffer;
  try {
    audioBuffer = await elevenRes.arrayBuffer();
  } catch (bufErr: unknown) {
    const msg = bufErr instanceof Error ? bufErr.message : String(bufErr);
    console.error("[TTS] Failed to read audio buffer from ElevenLabs response:", msg);
    return NextResponse.json(
      { error: `Failed to read audio data: ${msg}` },
      { status: 500 }
    );
  }

  console.log(
    `[TTS] Success — returning ${audioBuffer.byteLength} bytes of audio/mpeg`
  );

  return new NextResponse(audioBuffer, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
}
