import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_INSTRUCTION =
  "You are Jordan, a tough but fair hiring manager. The user is a college student negotiating their internship compensation. Push back initially, but concede if they make strong arguments. Reply strictly in JSON format with three keys: 'reply' (your text response), 'confidence_score' (number 1-10), and 'feedback' (array of 1-2 actionable tips based on their last message).";

interface HistoryPart {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = (await req.json()) as {
      message: string;
      history: HistoryPart[];
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey =
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "your_gemini_api_key") {
      return NextResponse.json({
        reply:
          "I appreciate you starting the conversation. What salary range were you hoping for with this internship?",
        confidence_score: 5,
        feedback: [
          "Lead with your specific value — mention relevant coursework or projects.",
          "Research typical intern pay in your field before the conversation.",
        ],
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
        maxOutputTokens: 512,
      },
    });

    // Map the incoming history — roles must be "user" or "model"
    const incomingHistory: HistoryPart[] = history.map((turn) => ({
      role: turn.role === "user" ? "user" : "model",
      parts: turn.parts,
    }));

    const chat = model.startChat({ history: incomingHistory });
    const result = await chat.sendMessage(message.trim());
    const raw = result.response.text().trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Attempt to extract a JSON object if the model wrapped it in prose
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        parsed = {
          reply: raw,
          confidence_score: 5,
          feedback: ["Could not parse structured feedback — try rephrasing your message."],
        };
      }
    }

    return NextResponse.json(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
