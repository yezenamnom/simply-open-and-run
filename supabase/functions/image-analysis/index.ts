import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { imageUrl, language = "ar" } = body;

    // Validate imageUrl
    if (!imageUrl || typeof imageUrl !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: "Image URL is required and must be a string" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Validate URL format
    try {
      const url = new URL(imageUrl);
      // Only allow https URLs for security
      if (url.protocol !== 'https:') {
        throw new Error('Only HTTPS URLs are allowed');
      }
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid URL format. Must be a valid HTTPS URL." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Validate URL length
    if (imageUrl.length > 2000) {
      return new Response(
        JSON.stringify({ success: false, error: "URL too long. Maximum 2000 characters." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Validate language
    const validLanguages = ['ar', 'en', 'de'];
    const safeLanguage = validLanguages.includes(language) ? language : 'ar';

    // استدعاء Perplexity API لتحليل الصورة
    // يمكن استخدام Vision API أو Perplexity مع دعم الصور
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    
    if (!PERPLEXITY_API_KEY) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Perplexity API key not configured" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // تحليل الصورة باستخدام Perplexity
    const prompt = safeLanguage === "ar" 
      ? "حلل هذه الصورة وصف ما تراه بالتفصيل. ما هي العناصر الرئيسية؟ ما هو السياق؟"
      : safeLanguage === "de"
      ? "Analysiere dieses Bild und beschreibe, was du siehst. Was sind die Hauptelemente? Was ist der Kontext?"
      : "Analyze this image and describe what you see in detail. What are the main elements? What is the context?";

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-large-128k-online",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${errorText}`);
    }

    const data = await response.json();
    const description = data.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({
        success: true,
        description,
        language: safeLanguage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error analyzing image:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

