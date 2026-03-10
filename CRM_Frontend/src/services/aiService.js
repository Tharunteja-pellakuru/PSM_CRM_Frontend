import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";

// --- Provider detection ---
const isOpenAIModel = (modelId = "") =>
  modelId.startsWith("gpt-") ||
  modelId.startsWith("o1") ||
  modelId.startsWith("o3");

const isAnthropicModel = (modelId = "") =>
  modelId.toLowerCase().includes("claude");

const isGroqModel = (modelId = "") =>
  modelId.toLowerCase().includes("llama") ||
  modelId.toLowerCase().includes("mixtral") ||
  modelId.toLowerCase().includes("gemma");

// --- Anthropic JSON call helper ---
const callClaude = async (apiKey, modelId, prompt) => {
  const anthropic = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  const response = await anthropic.messages.create({
    model: modelId,
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: prompt + "\n\nReturn MUST be valid JSON only.",
      },
    ],
  });
  // Extract text content
  const text = response.content.find((c) => c.type === "text")?.text || "{}";
  return text;
};

// --- Groq JSON call helper ---
const callGroq = async (apiKey, modelId, prompt) => {
  const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
  const response = await groq.chat.completions.create({
    model: modelId,
    messages: [
      {
        role: "user",
        content: prompt + "\n\nReturn MUST be valid JSON only.",
      },
    ],
    response_format: { type: "json_object" },
  });
  return response.choices[0]?.message?.content || "{}";
};

// --- OpenAI JSON call helper ---
const callOpenAI = async (apiKey, modelId, prompt) => {
  const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  const response = await client.chat.completions.create({
    model: modelId,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });
  return response.choices[0]?.message?.content || "{}";
};

// --- Gemini JSON call helper (new @google/genai v1.x API) ---
const callGemini = async (apiKey, modelId, prompt, schema) => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: modelId || "llama-3.3-70b-versatile",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    return response.text;
  } catch (error) {
    if (error?.message) {
      try {
        // Attempt to parse out structured error data if present in message
        const errorJsonStr = error.message.includes("{")
          ? error.message.substring(error.message.indexOf("{"))
          : "{}";
        const errorBody = JSON.parse(errorJsonStr);

        if (errorBody?.error) {
          error.status = errorBody.error.status;
          error.code = errorBody.error.code;

          // Extract retry delay if available
          const retryInfo = errorBody.error.details?.find((d) =>
            d["@type"]?.includes("RetryInfo"),
          );
          if (retryInfo?.retryDelay) {
            error.retryDelay = parseInt(retryInfo.retryDelay);
          }
        }
      } catch (e) {
        /* ignore parse errors */
      }
    }
    throw error;
  }
};

// --- Gemini plain text helper (for non-JSON responses) ---
const callGeminiText = async (apiKey, modelId, prompt) => {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: modelId || "llama-3.3-70b-versatile",
    contents: prompt,
  });
  return response.text;
};

// --- Error Parsing Helper ---
const parseRetryAfter = (error) => {
  const msg = error?.message || "";

  // Groq format: "Please try again in 5m43.008s" or "Please try again in 5m 43s"
  const groqMatch = msg.match(
    /try again in\s+(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:([\d.]+)s)?/i,
  );
  if (groqMatch) {
    const hours = parseInt(groqMatch[1] || "0");
    const minutes = parseInt(groqMatch[2] || "0");
    const seconds = parseFloat(groqMatch[3] || "0");

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    error.retryDelay = Math.ceil(totalSeconds) + 2;

    let timeStr = "";
    if (hours > 0) timeStr += `${hours}h `;
    if (minutes > 0) timeStr += `${minutes}m `;
    if (seconds > 0) timeStr += `${seconds}s`;
    error.retryAfter = timeStr.trim();
    return;
  }

  // Gemini format: "retry in 10s"
  const geminiMatch = msg.match(/retry in ([\d.]+)s/i);
  if (geminiMatch) {
    error.retryDelay = Math.ceil(parseFloat(geminiMatch[1])) + 2;
    error.retryAfter = `${geminiMatch[1]}s`;
    return;
  }
};

// ----------------------------------------------------------------

export const generateClientSummary = async (
  client,
  projects,
  apiKey = process.env.API_KEY,
) => {
  try {
    const projectSummary = projects
      .map((p) => `- ${p.name} (${p.status}, $${p.budget})`)
      .join("\n");

    const prompt = `
      You are an expert CRM assistant. Analyze the following client data and provide a concise, professional executive summary (max 3 sentences).
      Highlight key risks or opportunities based on the notes and project status.
      
      Client: ${client.name} (${client.company})
      Status: ${client.status}
      Notes: ${client.notes}
      Projects:
      ${projectSummary}
    `;

    const text = await callGeminiText(
      apiKey,
      "llama-3.3-70b-versatile",
      prompt,
    );
    return text || "No summary generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate summary at this time.";
  }
};

export const generateEmailDraft = async (
  client,
  context,
  apiKey = process.env.API_KEY,
) => {
  try {
    const prompt = `
        Draft a professional, short email to ${client.name} from ${client.company}.
        Context: ${context}
        Tone: Professional, helpful, concise.
        Sign off: "Best, The Parivartan Team"
      `;
    const text = await callGeminiText(
      apiKey,
      "llama-3.3-70b-versatile",
      prompt,
    );
    return text || "No draft generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate email draft.";
  }
};

export const suggestNextAction = async (
  client,
  apiKey = process.env.API_KEY,
) => {
  try {
    const prompt = `Based on these notes: "${client.notes}", suggest the single most important next step for a CRM manager. Start with a verb. Keep it under 10 words.`;
    const text = await callGeminiText(
      apiKey,
      "llama-3.3-70b-versatile",
      prompt,
    );
    return text || "Review account.";
  } catch (e) {
    return "Review account.";
  }
};

export const analyzeEnquiryRelevance = async (
  enquiry,
  apiKey = process.env.API_KEY,
  modelId = "llama-3.3-70b-versatile",
) => {
  const prompt = `
You are a strict AI enquiry classifier for EParivartan, a digital services company.
Your goal is to categorize enquiries as either RELEVANT or IRRELEVANT based on our service offerings.
X
EParivartan ONLY offers these services:
- Website Development (WordPress, React, HTML/CSS)
- Web Application Development (MERN stack, full-stack)
- Mobile App Development (Flutter, React Native)
- E-commerce Website Development
- SEO (Search Engine Optimization)
- Digital Marketing & Social Media Marketing
- Brand Promotion & Online Branding
- UI/UX Design (digital interfaces only)
- Media Services (video editing, thumbnails, content creation)

LABEL DEFINITIONS:
1. RELEVANT: The user is asking to BUILD, DESIGN, or MARKET something digital that falls within our services.
2. IRRELEVANT: Everything else, including:
   - Job/Internship applications ("I want to work for you", "Hiring?")
   - Physical services (Interior design, architecture, construction, farming)
   - Hardware/Product supply requests
   - Personal messages with no business intent
   - SPAM (Crypto scams, gambling, bot-generated gibberish)
   - Agencies selling THEIR services TO us

STRICT RULES:
- If it is a job application, it is IRRELEVANT.
- If it is for a service we don't provide (like interior design), it is IRRELEVANT.
- Only mark as RELEVANT if they are a potential customer for our digital/media services.

Input Enquiry:
Name: ${enquiry.name}
Email: ${enquiry.email}
Phone: ${enquiry.phone || "Not provided"}
Website: ${enquiry.website || "Not provided"}
Message: ${enquiry.message}

Return ONLY valid JSON:
{
  "isRelevant": true or false,
  "label": "RELEVANT | IRRELEVANT",
  "category": "Detailed category name (e.g., SEO, Web Dev, Job App, Spam)",
  "leadScore": number between 0 and 100,
  "reason": "Very short explanation why it is Relevant or Irrelevant"
}
  `;

  try {
    let text;
    if (isOpenAIModel(modelId)) {
      text = await callOpenAI(apiKey, modelId, prompt);
    } else if (isAnthropicModel(modelId)) {
      text = await callClaude(apiKey, modelId, prompt);
    } else if (isGroqModel(modelId)) {
      text = await callGroq(apiKey, modelId, prompt);
    } else {
      text = await callGemini(apiKey, modelId, prompt, {
        type: Type.OBJECT,
        properties: {
          isRelevant: { type: Type.BOOLEAN },
          category: { type: Type.STRING },
          leadScore: { type: Type.NUMBER },
          reason: { type: Type.STRING },
        },
        required: ["isRelevant", "category", "leadScore", "reason"],
      });
    }

    const jsonResult = JSON.parse(text || "{}");
    const label = (jsonResult.label || "").toString().toUpperCase().trim();
    const isRelevant =
      typeof jsonResult.isRelevant === "boolean"
        ? jsonResult.isRelevant
        : label === "RELEVANT";

    return {
      isRelevant,
      category:
        jsonResult.category || (isRelevant ? "Relevant Lead" : "Irrelevant"),
      label: isRelevant ? "RELEVANT" : "IRRELEVANT",
      leadScore: jsonResult.leadScore ?? (isRelevant ? 70 : 10),
      reason: jsonResult.reason || "AI analysis completed",
    };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    parseRetryAfter(error);
    throw error;
  }
};

export const batchAnalyzeEnquiries = async (
  enquiries,
  apiKey = process.env.API_KEY,
  modelId = "llama-3.3-70b-versatile",
) => {
  if (!enquiries || enquiries.length === 0) return [];

  const enquiriesData = enquiries
    .map(
      (e, index) => `
ENTRY_ID: ${index}
Name: ${e.name}
Email: ${e.email}
Message: ${e.message}
`,
    )
    .join("\n---\n");

  const prompt = `
You are a strict AI enquiry classifier for EParivartan.
Analyze the following ${enquiries.length} enquiries and categorize each as RELEVANT or IRRELEVANT.

EParivartan SERVICES: Website Dev, Web Apps (MERN), Mobile Apps (Flutter), E-commerce, SEO, Digital Marketing, UI/UX, Media Services (Video/Design).

LABEL DEFINITIONS:
1. RELEVANT: Potential clients for our digital/media services.
2. IRRELEVANT: Job/Internship applications, physical services (Interior, Construction), Spam, personal messages, or agencies selling to us.

Batch Input:
${enquiriesData}

Return ONLY a JSON object with a "results" array:
{
  "results": [
    {
      "entryId": number,
      "isRelevant": boolean,
      "label": "RELEVANT | IRRELEVANT",
      "category": "Short category",
      "leadScore": 0-100,
      "reason": "Short reason"
    }
  ]
}
`;

  try {
    let text;
    if (isOpenAIModel(modelId)) {
      text = await callOpenAI(apiKey, modelId, prompt);
    } else if (isAnthropicModel(modelId)) {
      text = await callClaude(apiKey, modelId, prompt);
    } else if (isGroqModel(modelId)) {
      text = await callGroq(apiKey, modelId, prompt);
    } else {
      text = await callGemini(apiKey, modelId, prompt, {
        type: Type.OBJECT,
        properties: {
          results: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                entryId: { type: Type.NUMBER },
                isRelevant: { type: Type.BOOLEAN },
                label: { type: Type.STRING },
                category: { type: Type.STRING },
                leadScore: { type: Type.NUMBER },
                reason: { type: Type.STRING },
              },
              required: [
                "entryId",
                "isRelevant",
                "label",
                "category",
                "leadScore",
                "reason",
              ],
            },
          },
        },
        required: ["results"],
      });
    }

    const jsonResult = JSON.parse(text || '{"results":[]}');
    return (jsonResult.results || []).map((res, i) => {
      const isRel = res.isRelevant ?? res.label === "RELEVANT";
      return {
        id: enquiries[res.entryId || i].id,
        isRelevant: isRel,
        label: isRel ? "RELEVANT" : "IRRELEVANT",
        category: res.category || (isRel ? "Relevant Lead" : "Irrelevant"),
        leadScore: res.leadScore ?? (isRel ? 70 : 10),
        reason: res.reason || "Batch analysis completed",
      };
    });
  } catch (error) {
    console.error("Batch Analysis Error:", error);
    parseRetryAfter(error);
    throw error;
  }
};

export const analyzeEnquiriesCustomBatch = async (
  enquiries,
  customPrompt,
  modelId = "llama-3.3-70b-versatile",
  apiKey = process.env.API_KEY,
) => {
  if (!enquiries || enquiries.length === 0) return {};

  const enquiriesData = enquiries
    .map(
      (e, index) => `
ENTRY_ID: ${index}
Name: ${e.name}
Email: ${e.email}
Message: ${e.message}
`,
    )
    .join("\n---\n");

  const prompt = `
You are an AI filter assistant for a CRM system. 
Analyze these ${enquiries.length} enquiries based on the following custom criteria:

--- USER FILTER PROMPT ---
${customPrompt}
--- END FILTER PROMPT ---

Batch Input:
${enquiriesData}

Return ONLY a JSON object with a "results" array:
{
  "results": [
    {
      "entryId": number,
      "isRelevant": boolean,
      "reason": "short explanation"
    }
  ]
}
`;

  try {
    let text;
    if (isOpenAIModel(modelId)) {
      text = await callOpenAI(apiKey, modelId, prompt);
    } else if (isAnthropicModel(modelId)) {
      text = await callClaude(apiKey, modelId, prompt);
    } else if (isGroqModel(modelId)) {
      text = await callGroq(apiKey, modelId, prompt);
    } else {
      text = await callGemini(apiKey, modelId, prompt, {
        type: Type.OBJECT,
        properties: {
          results: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                entryId: { type: Type.NUMBER },
                isRelevant: { type: Type.BOOLEAN },
                reason: { type: Type.STRING },
              },
              required: ["entryId", "isRelevant", "reason"],
            },
          },
        },
        required: ["results"],
      });
    }

    const jsonResult = JSON.parse(text || '{"results":[]}');
    const mapped = {};
    (jsonResult.results || []).forEach((res, i) => {
      const idx = res.entryId ?? i;
      if (enquiries[idx]) {
        mapped[enquiries[idx].id] = {
          isRelevant: res.isRelevant ?? true,
          reason: res.reason || "Custom analysis completed",
        };
      }
    });
    return mapped;
  } catch (error) {
    console.error("Custom Batch Analysis Error:", error);
    parseRetryAfter(error);
    throw error;
  }
};
