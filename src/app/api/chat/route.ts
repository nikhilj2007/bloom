import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const NEGOTIATE_SYSTEM_INSTRUCTION =
  "You are Jordan, a tough but fair hiring manager. The user is a college student negotiating their internship compensation. Push back initially, but concede if they make strong arguments. Reply strictly in JSON format with three keys: 'reply' (your text response), 'confidence_score' (number 1-10), and 'feedback' (array of 1-2 actionable tips based on their last message).";

export async function POST(req: Request) {
  try {
    // 1. Auth key
    const apiKey =
      process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is missing from environment" },
        { status: 500 }
      );
    }

    // 2. Parse body — mode + optional systemContext added for Budget Coach tab
    const body = await req.json();
    const { message, history, systemContext, mode } = body;
    const isBudget = mode === "budget";

    // 3. Select system instruction
    //    Budget mode: the frontend provides a personalised financial context string.
    //    Negotiate mode: use the hardcoded Jordan persona.
    const systemInstruction = isBudget
      ? (systemContext as string) || "You are Glow, a helpful financial coach."
      : NEGOTIATE_SYSTEM_INSTRUCTION;

    // 4. Initialise the model
    //    Budget mode → plain-text response (no JSON schema enforcement).
    //    Negotiate mode → JSON-only response.
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction,
      ...(isBudget
        ? {}
        : { generationConfig: { responseMimeType: "application/json" } }),
    });

    // 5. Map history exactly as Gemini expects
    const formattedHistory = (history || []).map((msg: { role: string; parts: { text: string }[] }) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.parts[0].text }],
    }));

    // 6. Send the message
    const chat = model.startChat({ history: formattedHistory });
    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    // 7. Return the response
    //    Budget → plain text wrapped in { reply }.
    //    Negotiate → parsed JSON (strips accidental markdown fences).
    if (isBudget) {
      return NextResponse.json({ reply: responseText });
    }

    const cleanText = responseText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    const parsedData = JSON.parse(cleanText);
    return NextResponse.json(parsedData);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to generate response.";
    console.error("Gemini Backend Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
