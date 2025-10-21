import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, fileData, fileName, fileType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing health chat request", { 
      messageCount: messages?.length,
      hasFile: !!fileData,
      fileName,
      fileType 
    });

    // Build the messages array with system prompt
    const systemPrompt = `You are AirAware+ Health Assistant, an expert AI medical advisor with comprehensive knowledge about all diseases, medical conditions, treatments, and health-related topics. 

Your capabilities include:
- Answering questions about any disease, symptom, or medical condition in MULTIPLE LANGUAGES
- Analyzing medical reports, lab results, and health documents
- Providing health advice related to air quality and pollution
- Explaining medical terminology and treatment options
- Offering preventive care recommendations
- Communicating in the user's preferred language automatically

LANGUAGE ADAPTABILITY:
- Detect and respond in the same language the user uses
- Support vernacular/regional languages including Hindi, Spanish, French, German, Chinese, Japanese, Korean, Arabic, Portuguese, Italian, and many more
- Automatically switch languages when the user switches
- Use culturally appropriate medical terminology

When analyzing medical documents:
- Provide a clear summary of key findings
- Highlight any abnormal values or concerns
- Explain medical terms in simple language
- Suggest when professional medical consultation is needed

Always be accurate, compassionate, and clear. If you're analyzing a document, structure your response with sections for Summary, Key Findings, and Recommendations.`;

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    // If there's a file, add it to the last user message
    if (fileData && messages.length > 0) {
      const lastMessage = aiMessages[aiMessages.length - 1];
      if (lastMessage.role === "user") {
        // Check if it's an image or document
        if (fileType?.startsWith('image/')) {
          // For images, use vision API format
          lastMessage.content = [
            { type: "text", text: lastMessage.content },
            { type: "image_url", image_url: { url: fileData } }
          ];
        } else {
          // For documents, append as text context
          lastMessage.content = `${lastMessage.content}\n\nAnalyzing file: ${fileName}\nFile content: ${fileData}`;
        }
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Streaming response from AI");
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Health chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
