import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Grab the key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key is missing from environment" }, { status: 500 });
    }

    // 2. Parse the frontend data
    const body = await req.json();
    const { message, history } = body;

    // 3. Initialize Gemini 2.0 Flash
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "You are Jordan, a tough but fair hiring manager. The user is a college student negotiating their internship compensation. Push back initially, but concede if they make strong arguments. Reply strictly in JSON format with three keys: 'reply' (your text response), 'confidence_score' (number 1-10), and 'feedback' (array of 1-2 actionable tips based on their last message).",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    // 4. Map the history array exactly how Gemini expects it
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.parts[0].text }],
    }));

    // 5. Start the chat with context, then send the new message
    const chat = model.startChat({ history: formattedHistory });
    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    // 6. Safely parse the JSON (Strips markdown formatting if Gemini accidentally adds it)
    const cleanText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsedData = JSON.parse(cleanText);

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("Gemini Backend Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate response." },
      { status: 500 }
    );
  }
}