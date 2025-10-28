import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

const PPLX_API_KEY = process.env.NEXT_PUBLIC_PPLX_API_KEY;

if (
  !PPLX_API_KEY ||
  !process.env.NEXT_PUBLIC_API_KEY ||
  !process.env.NEXT_PUBLIC_GEMINI_API_KEY
) {
  throw new Error("API keys are not set in environment variables");
}

const geminiClient = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
});
const openAIclient = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function generateGeminiResponse(prompt: string) {
  const response = await geminiClient.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  console.log(response.text);
  return response.text;
}

export async function generateOpenAIResponse(prompt: string) {
  const response = await openAIclient.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You have to give responses in this format: {
  "content": "<Your Response here>",
  "metadata": {
    "context": "preference setting",
    "importance": 7,
    "tags": ["preference", "color", "personal"],
    "timestamp": "2025-06-06T14:30:00Z",
    "client": "openAI"
  }
}`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "gpt-4o",
    max_tokens: 1024,
    response_format: {
      type: "json_object",
    },
  });

  return response;
}

export async function generatePerplexityResponse(prompt: string) {
  // Set up the API endpoint and headers
  const url = "https://api.perplexity.ai/chat/completions";
  const headers = {
    Authorization: `Bearer ${PPLX_API_KEY}`, // Replace with your actual API key
    "Content-Type": "application/json",
  };

  // Define the request payload
  const payload = {
    model: "sonar-pro",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  };

  // Make the API call
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  // Print the AI's response
  console.log(data); // replace with console.log(data.choices[0].message.content) for just the content
  return data.choices[0].message.content;
}

export async function runAllResponses(prompt: string) {
  try {
    console.log("Generating response from Gemini...");
    const geminiResponse = await generateGeminiResponse(prompt);
    console.log("Gemini Response:", geminiResponse);

    console.log("Generating response from OpenAI...");
    const openAIResponse = await generateOpenAIResponse(prompt);
    console.log("OpenAI Response:", openAIResponse.choices[0].message.content);

    console.log("Generating response from Perplexity...");
    const perplexityResponse = await generatePerplexityResponse(prompt);
    console.log("Perplexity Response:", perplexityResponse);
  } catch (error) {
    console.error("Error while generating responses:", error);
  }
}

runAllResponses("Red is my favourite color!");
