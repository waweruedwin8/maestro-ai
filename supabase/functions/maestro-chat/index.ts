import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages, userMessage } = await req.json();
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    console.log(`Maestro chat request: "${userMessage}"`);

    const systemPrompt = `You are Maestro AI, an expert music assistant specializing in choral music, music theory, composition, and practice coaching.

Your core capabilities:
1. **Panic Practice Mode** - Help singers quickly find and practice their vocal parts (SATB)
2. **Composer Mode** - Help users compose melodies with ANY complexity (syncopation, rests, dotted notes, specific time signatures)
3. **Theory Teacher Mode** - Explain music theory concepts clearly with examples

CRITICAL FOR COMPOSER MODE:
When users request composition, you MUST generate actual ABC notation that matches their request EXACTLY:
- Parse their rhythmic requests: "semiquavers" = 1/16 notes, "quavers" = 1/8 notes, "crotchets" = 1/4 notes
- Handle time signatures: 6/16, 4/4, 3/4, 6/8, 12/8, etc.
- Include rests using "z" notation (z = quarter rest, z/2 = eighth rest, z/4 = sixteenth rest)
- Include dotted notes using ">" (e.g., C> = dotted note)
- Create syncopation by placing accents on weak beats
- Accept solfa notation (do re mi) OR letter notation (C D E) OR plain text descriptions

ABC NOTATION RULES:
- X:1 is the tune number
- M:6/16 sets time signature
- L:1/16 sets default note length
- Notes: C D E F G A B c (lowercase = octave higher)
- Rests: z (length follows same rules as notes)
- Dotted: C> or C3/2 
- Ties: C-C
- Bar lines: | and |] for end
- Syncopation: offset rhythms across bar lines

EXAMPLE - Complex syncopated rhythm in 6/16:
"X:1\\nT:Syncopated Study\\nM:6/16\\nL:1/16\\nQ:1/8=120\\nK:C\\n| z C D E>F z | G z A B c z | d>e f z e>d | c B A G F E |]"

You MUST set the abc_notation property with valid ABC notation matching the user's exact requirements.

Guidelines:
- Be enthusiastic and knowledgeable about music
- Give concise, practical advice
- When users want to practice, identify the song and voice part
- When users describe melodies OR request compositions, GENERATE the actual notation
- When explaining theory, use clear analogies and relate to the piano keyboard
- Reference the available sample pieces: Sample 1 (D major), Sample 2 (G major), Sample 3 (A major), Amazing Grace
- Always be encouraging and supportive of the user's musical journey
- Keep responses focused and under 150 words
- If the user's request doesn't clearly map to a mode, have a helpful conversation about music and suggest how you can help`;

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...(messages || []),
      { role: "user", content: userMessage },
    ];

    const tools = [
      {
        type: "function",
        function: {
          name: "render_component",
          description: "Render an interactive music component based on user's request",
          parameters: {
            type: "object",
            properties: {
              component_type: {
                type: "string",
                enum: ["panic-practice", "composer", "theory-teacher", "full-score", "upload-sheet", "none"],
                description: "Which component to render. Use 'composer' when user wants to create, compose, or generate music/rhythms/melodies.",
              },
              props: {
                type: "object",
                description: "Props for the component",
                properties: {
                  songTitle: { type: "string", description: "Song title for panic-practice mode" },
                  voicePart: { type: "string", enum: ["soprano", "alto", "tenor", "bass"], description: "Voice part" },
                  tempo: { type: "integer", description: "Tempo in BPM" },
                  melody: { type: "string", description: "Space-separated notes for composer mode (e.g., 'C D E F G')" },
                  abc_notation: { 
                    type: "string", 
                    description: "REQUIRED for composer mode. Full ABC notation string that MUST match the user's rhythmic/melodic request. Include correct time signature, note durations, rests, dotted notes, syncopation as requested. This is what will be displayed and played." 
                  },
                  timeSignature: { type: "string", description: "Time signature for the composition (e.g., '6/16', '4/4')" },
                  key: { type: "string", description: "Key signature" },
                  concept: { type: "string", enum: ["minor-chord", "major-chord", "dominant7"], description: "Theory concept ID" },
                  highlightNotes: { type: "array", items: { type: "string" }, description: "Notes to highlight on piano" },
                  explanation: { type: "string", description: "Custom theory explanation" },
                },
              },
            },
            required: ["component_type", "props"],
          },
        },
      },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
        tools,
        tool_choice: "auto",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway returned ${response.status}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0]?.message;

    console.log("AI response:", JSON.stringify(choice).slice(0, 1000));

    // Extract text content and tool call
    let textContent = choice?.content || "";
    let component = null;

    if (choice?.tool_calls?.length > 0) {
      const toolCall = choice.tool_calls[0];
      try {
        const args = JSON.parse(toolCall.function.arguments);
        if (args.component_type && args.component_type !== "none") {
          component = {
            type: args.component_type,
            props: args.props || {},
          };
          
          // Log composer props for debugging
          if (args.component_type === "composer") {
            console.log("Composer props:", JSON.stringify(args.props));
          }
        }
      } catch (e) {
        console.error("Failed to parse tool call:", e);
      }
    }

    // If no text content but there's a tool call, generate a brief response
    if (!textContent && component) {
      textContent = "Here you go! I've loaded the right tools for you.";
    }

    if (!textContent && !component) {
      textContent = "I'm here to help with your music! Try asking me to help you practice a part, compose a melody, or explain a theory concept.";
    }

    return new Response(
      JSON.stringify({
        content: textContent,
        component,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Maestro chat error:", error);
    return new Response(
      JSON.stringify({
        content: "I had a moment of stage fright! 😅 Could you try asking again?",
        component: null,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 200, // Return 200 so the UI can show the fallback message
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});