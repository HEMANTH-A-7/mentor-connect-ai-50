import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get current user profile
    const { data: userProfile, error: userError } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !userProfile) {
      throw new Error("User profile not found");
    }

    // Get all potential mentors (alumni with similar interests/department)
    const { data: mentors, error: mentorsError } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("role", "alumni")
      .neq("id", userId);

    if (mentorsError || !mentors) {
      throw new Error("Could not fetch mentors");
    }

    // Use AI to rank mentors based on compatibility
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const prompt = `
You are an AI mentor matching system for EduConnect, an alumni-student connection platform.

Student Profile:
- Department: ${userProfile.department}
- Skills: ${userProfile.skills?.join(", ") || "Not specified"}
- Interests: ${userProfile.interests?.join(", ") || "Not specified"}
- Bio: ${userProfile.bio || "Not specified"}

Available Alumni Mentors:
${mentors.map((m, i) => `
${i + 1}. ${m.full_name}
   - Company: ${m.company || "Not specified"}
   - Job Title: ${m.job_title || "Not specified"}
   - Department: ${m.department || "Not specified"}
   - Skills: ${m.skills?.join(", ") || "Not specified"}
   - Interests: ${m.interests?.join(", ") || "Not specified"}
   - Bio: ${m.bio || "Not specified"}
`).join("\n")}

Please analyze the compatibility between the student and each alumni mentor. Consider:
1. Department/field alignment
2. Skill overlap and complementarity
3. Shared interests
4. Career path relevance
5. Potential for meaningful mentorship

Rank the top 5 most compatible mentors and provide a brief explanation (1-2 sentences) for why each match would be beneficial.

Return ONLY valid JSON in this exact format:
{
  "matches": [
    {
      "mentorIndex": 0,
      "score": 95,
      "reason": "Strong alignment in..."
    }
  ]
}
`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a mentor matching AI. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      throw new Error("AI matching failed");
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;

    // Parse AI response
    const matchResult = JSON.parse(aiContent);

    // Map matches to full mentor profiles
    const rankedMentors = matchResult.matches.map((match: any) => ({
      ...mentors[match.mentorIndex],
      matchScore: match.score,
      matchReason: match.reason,
    }));

    return new Response(
      JSON.stringify({ mentors: rankedMentors }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in match-mentors function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
