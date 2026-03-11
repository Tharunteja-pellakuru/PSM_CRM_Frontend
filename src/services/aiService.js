import { BASE_URL } from "../constants/config";

// AI Analysis API calls through backend (secure - no API keys exposed)

export const generateClientSummary = async (client, projects) => {
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

    // Call backend API instead of direct API
    const response = await fetch(`${BASE_URL}/api/ai/analyze-enquiry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enquiry: {
          name: client.name,
          email: client.email || "",
          message: prompt,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate summary");
    }

    const data = await response.json();
    return data.reason || "No summary generated.";
  } catch (error) {
    console.error("AI Summary Error:", error);
    return "Unable to generate summary at this time.";
  }
};

export const generateEmailDraft = async (client, context) => {
  try {
    const prompt = `
        Draft a professional, short email to ${client.name} from ${client.company}.
        Context: ${context}
        Tone: Professional, helpful, concise.
        Sign off: "Best, The Parivartan Team"
      `;

    const response = await fetch(`${BASE_URL}/api/ai/analyze-enquiry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enquiry: {
          name: client.name,
          email: client.email || "",
          message: prompt,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate email");
    }

    const data = await response.json();
    return data.reason || "No draft generated.";
  } catch (error) {
    console.error("AI Email Error:", error);
    return "Unable to generate email draft.";
  }
};

export const suggestNextAction = async (client) => {
  try {
    const prompt = `Based on these notes: "${client.notes}", suggest the single most important next step for a CRM manager. Start with a verb. Keep it under 10 words.`;

    const response = await fetch(`${BASE_URL}/api/ai/analyze-enquiry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enquiry: {
          name: client.name,
          email: client.email || "",
          message: prompt,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to suggest action");
    }

    const data = await response.json();
    return data.reason || "Review account.";
  } catch (error) {
    console.error("AI Action Error:", error);
    return "Review account.";
  }
};

// Analyze single enquiry - now calls backend API
export const analyzeEnquiryRelevance = async (enquiry, apiKey, modelId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/ai/analyze-enquiry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enquiry,
        modelId, // optional - backend will use default if not provided
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Analysis failed");
    }

    return await response.json();
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
};

// Batch analyze enquiries - now calls backend API
export const batchAnalyzeEnquiries = async (enquiries, apiKey, modelId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/ai/batch-analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enquiries,
        modelId, // optional - backend will use default if not provided
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Batch analysis failed");
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Batch Analysis Error:", error);
    throw error;
  }
};

// Custom batch analysis - now calls backend API
export const analyzeEnquiriesCustomBatch = async (
  enquiries,
  customPrompt,
  modelId,
  apiKey,
) => {
  try {
    // Transform to use the batch analyze endpoint with custom logic
    const response = await fetch(`${BASE_URL}/api/ai/batch-analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enquiries,
        modelId,
        customPrompt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Custom analysis failed");
    }

    const data = await response.json();
    
    // Convert array to mapped object by ID
    const mapped = {};
    data.results.forEach((res) => {
      mapped[res.id] = {
        isRelevant: res.isRelevant,
        reason: res.reason,
      };
    });
    return mapped;
  } catch (error) {
    console.error("Custom Batch Analysis Error:", error);
    throw error;
  }
};
