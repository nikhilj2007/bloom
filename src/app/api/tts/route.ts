import { NextRequest, NextResponse } from "next/server";

// Rachel voice — professional female voice by ElevenLabs
const VOICE_ID = "pNInz6obbfDQGcgMyIGD";
const ELEVENLABS_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ELEVENLABS_API_KEY is not set" },
        { status: 500 }
      );
    }

    const { text } = await req.json();
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    // Trim to 500 chars to stay within ElevenLabs free-tier limits for demo
    const trimmed = text.slice(0, 500);

    const elevenRes = await fetch(ELEVENLABS_URL, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
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

    if (!elevenRes.ok) {
      const errText = await elevenRes.text();
      console.error("ElevenLabs error:", errText);
      return NextResponse.json(
        { error: `ElevenLabs responded with ${elevenRes.status}` },
        { status: elevenRes.status }
      );
    }

    // Stream the audio buffer back to the client
    const audioBuffer = await elevenRes.arrayBuffer();
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "TTS request failed";
    console.error("TTS route error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
