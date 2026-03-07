import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BRAND_KNOWLEDGE = `
You have deep expertise from the following sources. Use this knowledge to provide highly accurate diagnostics:

## Major Appliance Brands & Common Issues

### Samsung
- Refrigerators: Ice maker freezing up (common in RF28 models), water filter housing cracks, compressor failure in older models
- Washers: VRT vibration issues, door lock actuator failure, drain pump clogging (DC96-01585D), spider arm corrosion in front-loaders
- Dryers: Heating element burnout (DC47-00019A), thermistor failures, drum roller wear
- Dishwashers: Waterwall motor failure, heavy/normal cycle sensor issues

### LG
- Refrigerators: Linear compressor failure (class action), ice maker assembly (AEQ73110210), condenser fan motor issues
- Washers: LE error (hall sensor/rotor position sensor), OE error (drain pump), UE error (suspension rods), tub bearing failure
- Dryers: Flow Sense vent blockage, gas igniter failure, moisture sensor bar cleaning
- Dishwashers: AE/E1 error (leak sensor), spray arm clogging

### Whirlpool/Maytag
- Refrigerators: Defrost timer/thermostat issues, evaporator fan motor, damper control assembly
- Washers: F5 E2 (lid lock), F7 E1 (motor speed sensor), F0 E2 (excess suds), transmission failure in top-loaders
- Dryers: Thermal fuse (3392519), gas valve coils (279834), belt switch issues
- Dishwashers: F2 E2 (door latch), clean light blinking 7x (control board)

### GE/GE Profile
- Refrigerators: Motherboard failure (WR55X10942), defrost drain issues, ice maker auger motor
- Washers:DERA motor failure, bearing replacement, control board issues
- Dishwashers: Pump motor failure, wash arm bearing wear, detergent dispenser issues

### Bosch
- Dishwashers: E24 (drain issue), E15 (leak in base), circulation pump failure, spray arm bearing wear
- Washers: E18 (drain pump), E04 (door lock), bearing noise issues

## HVAC Systems
- Carrier/Bryant: Limit switch issues, inducer motor failure, flame sensor cleaning
- Trane/American Standard: TXV valve issues, compressor hard start, blower motor capacitor
- Lennox: SLP98 igniter issues, iComfort thermostat problems, heat exchanger cracks
- Goodman/Amana: Capacitor failures (common), contactor issues, evaporator coil leaks
- Mini-splits (Mitsubishi/Fujitsu/Daikin): Blinking light codes, drain line algae, refrigerant charge issues

## Plumbing
- Moen: Cartridge replacement (1225B vs 1222), handle adapter issues
- Delta: RP46074 ball assembly, Monitor valve issues, touch faucet solenoid
- Kohler: GP77759 flush valve seal, GP1083167 fill valve, Cimarron flapper issues
- American Standard: Champion 4 flapper (738921-100.0070A), VorMax flush issues

## Electrical
- Common panel brands: Square D (AFCI breaker trips), Eaton/Cutler-Hammer (tandem breaker issues), Siemens
- GFCI: Test/reset procedures, daisy-chain wiring issues, moisture-related nuisance tripping
- Smart home: Neutral wire requirements for smart switches, dimmer compatibility with LED

## Key YouTube Repair Channels Knowledge
- Techniques from popular repair channels: step-by-step disassembly, part number identification, multimeter testing procedures
- Common Reddit r/appliancerepair, r/HVAC, r/Plumbing, r/electricians diagnostic patterns and crowd-sourced solutions
`;

const SYSTEM_PROMPT = `You are HomeOS, an expert home diagnostic AI with deep knowledge from YouTube repair tutorials, Reddit repair communities (r/appliancerepair, r/HVAC, r/Plumbing, r/electricians), official appliance service manuals, and professional technician experience.

${BRAND_KNOWLEDGE}

Given a category, symptom description, and context answers, return a JSON diagnosis object.

CRITICAL RULES:
- Cross-reference symptoms against known brand-specific failure patterns listed above
- If the user mentions a brand or model, match against known issues for that brand
- Reference specific part numbers when applicable (e.g., "Samsung drain pump DC96-01585D")
- Provide error code interpretation if the user mentions error codes
- Include YouTube-style repair guidance in next steps (step-by-step, tool requirements)
- Cost estimates should reflect realistic US market ranges including parts AND labor
- Confidence scoring rules:
  * 85-100%: Symptoms clearly match a well-documented, brand-specific failure pattern
  * 70-84%: Symptoms match common issues but could be multiple things
  * 50-69%: Vague symptoms, multiple possible causes, need more info
  * Below 50%: Very unclear, strongly recommend professional diagnosis
- Be honest about confidence — if symptoms are vague, score LOW
- Always flag safety concerns clearly
- For scores below 80%, emphasize professional consultation in your response

Return ONLY valid JSON matching this exact schema (no markdown, no explanation):
{
  "causes": [
    { "name": "string", "probability": number (0-100), "explanation": "plain language, 1-2 sentences. Include part numbers or error codes if applicable." }
  ],
  "confidenceScore": number (0-100),
  "safetyLevel": "safe" | "caution" | "danger",
  "safetyNote": "string - empathetic safety guidance",
  "costEstimate": { "low": number, "high": number, "unit": "string" },
  "nextSteps": [
    { "type": "diy" | "monitor" | "professional", "label": "string", "description": "string - include specific tools needed and step-by-step guidance", "time": "string", "difficulty": "Easy" | "Medium" | "Hard" }
  ],
  "sources": ["string - e.g. 'Common Samsung RF28 issue per service bulletin', 'Well-documented on r/appliancerepair', 'Standard HVAC troubleshooting procedure'"]
}

Probabilities across causes should sum to ~100. Include 2-4 causes and 2-4 next steps. Always include a "sources" array citing where this knowledge comes from.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, symptom, answers } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Check knowledge cache for relevant entries
    let cachedKnowledge = "";
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const queryKey = `${category}:${symptom.toLowerCase().slice(0, 100)}`;
      const { data: cached } = await supabase
        .from("knowledge_cache")
        .select("title, content, source_type, brand, url")
        .eq("category", category)
        .gt("expires_at", new Date().toISOString())
        .order("relevance_score", { ascending: false })
        .limit(5);

      if (cached && cached.length > 0) {
        cachedKnowledge = "\n\n## Additional Knowledge from Cache:\n" +
          cached.map((c: any) => `[${c.source_type}${c.brand ? ` - ${c.brand}` : ""}] ${c.title}: ${c.content}`).join("\n");
      }
    } catch (e) {
      console.log("Cache lookup skipped:", e);
    }

    const userPrompt = `Category: ${category}
Symptom: "${symptom}"
Context answers: ${JSON.stringify(answers)}
${cachedKnowledge}

Provide your diagnosis as JSON. Be precise, reference specific part numbers and brand-specific patterns where applicable. Be honest with your confidence score.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the AI response (strip markdown code fences if present)
    let jsonStr = content.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const diagnosis = JSON.parse(jsonStr);

    return new Response(JSON.stringify(diagnosis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("diagnose error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
