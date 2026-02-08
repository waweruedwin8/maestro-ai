import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let parsedBody: { sheetId?: string; fileType?: string; storageUrl?: string } = {};
  try {
    parsedBody = await req.json();
    const { sheetId, fileType, storageUrl } = parsedBody;
    console.log(`Processing sheet: ${sheetId}, type: ${fileType}, url: ${storageUrl}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update status to processing
    await supabase
      .from("uploaded_sheets")
      .update({ processing_status: "processing" })
      .eq("id", sheetId);

    let prompt = "";

    if (fileType === "midi") {
      // For MIDI, we describe what we want the AI to extract
      prompt = `You are a music transcription expert. The user has uploaded a MIDI file. Based on the MIDI file URL provided, generate ABC notation for a 4-part choral arrangement (SATB).

Please respond with a JSON object using the tool provided. Include realistic ABC notation for each voice part. Set appropriate key signature, time signature, tempo, title, and composer if detectable.

The ABC notation should use standard format:
X:1
T:Title
K:Key
M:TimeSignature
L:1/8
Q:1/4=tempo
|: notes :|

Use standard ABC note values - uppercase for octave 4 (C D E F G A B), lowercase for octave 5 (c d e f g a b), commas for lower octaves (C, D,), apostrophes for higher.`;
    } else {
      // For images and PDFs - use vision to read the sheet music with improved prompting
      prompt = `You are an expert professional music transcription AI with extensive training in reading and transcribing printed and handwritten sheet music. Your task is to perform precise optical music recognition (OMR) on this music sheet image.

CRITICAL INSTRUCTIONS - READ CAREFULLY:

1. EXAMINE THE IMAGE THOROUGHLY before transcribing. Look at:
   - Staff lines and clefs (treble, bass, alto, tenor clefs)
   - Key signature (count sharps or flats carefully)
   - Time signature
   - All notes on each staff, including:
     * Note heads (filled vs hollow)
     * Stems (up or down)
     * Flags and beams
     * Dots (dotted notes)
     * Accidentals (sharps, flats, naturals)
     * Rests
   - Dynamics, articulations, and other markings
   - Lyrics if present (especially for choral music)
   - Part labels (Soprano, Alto, Tenor, Bass, etc.)

2. TRANSCRIBE TO ABC NOTATION with these rules:
   - X:1 (tune number)
   - T: (title - read from the score)
   - C: (composer - read from the score)  
   - K: (key signature - e.g., C, G, D, F, Bb, etc.)
   - M: (time signature - e.g., 4/4, 3/4, 6/8)
   - L:1/8 (default note length)
   - Q:1/4=tempo (estimate from style if not marked)
   
   NOTE ENCODING:
   - Uppercase letters = middle octave (C D E F G A B = C4 to B4)
   - Lowercase letters = higher octave (c d e f g a b = C5 to B5)
   - Comma after note = lower by one octave (C, = C3, C,, = C2)
   - Apostrophe after note = raise by one octave (c' = C6)
   - ^ before note = sharp (^F = F#)
   - _ before note = flat (_B = Bb)
   - = before note = natural
   
   RHYTHM (with L:1/8 default):
   - Number after note = multiply duration (C2 = quarter note, C4 = half note, C8 = whole note)
   - /2 after note = halve duration (C/2 = sixteenth note when L:1/8)
   - Dotted notes: C3 = dotted quarter (when L:1/8)
   
   RESTS:
   - z = eighth rest, z2 = quarter rest, z4 = half rest, z8 = whole rest
   
   BAR LINES:
   - | = single bar line
   - |] = final bar
   - |: = start repeat
   - :| = end repeat
   - :: = double repeat

3. FOR CHORAL MUSIC (SATB):
   - Transcribe EACH voice part separately
   - Soprano: typically treble clef, upper staff
   - Alto: typically treble clef, lower notes on upper staff or own staff
   - Tenor: may be treble clef (octave lower) or bass clef upper
   - Bass: bass clef, lower staff
   
   If only a melody line is visible, put it in soprano.

4. EXTRACT TONE.JS COMPATIBLE NOTES:
   For each part, also provide an array of note strings for playback:
   - Format: "C4", "D#5", "Bb3", etc.
   - Include the octave number
   - One note per beat/position (for chords, list the melody note)

5. QUALITY CHECKS:
   - Verify the transcription matches what you see
   - Ensure barlines align with time signature
   - Check that accidentals are correctly applied
   - Validate that note durations sum correctly per measure

RESPOND using the save_transcription tool with all extracted data. Be as accurate as possible - this transcription will be used for practice and performance.`;
    }

    // Build messages for AI
    const messages: Array<{ role: string; content: unknown }> = [
      { role: "system", content: prompt },
    ];

    if (fileType === "image" || fileType === "pdf") {
      // Fetch the file and convert to base64 data URL
      // Gemini only supports image URLs directly (PNG, JPEG, WebP, GIF)
      // PDFs and other formats must be sent as base64 data URLs
      console.log("Fetching file from storage for base64 conversion...");
      const fileResponse = await fetch(storageUrl);
      if (!fileResponse.ok) {
        throw new Error(`Failed to fetch file from storage: ${fileResponse.status}`);
      }
      const fileBuffer = await fileResponse.arrayBuffer();
      const uint8Array = new Uint8Array(fileBuffer);
      
      // Convert to base64
      let binary = '';
      const chunkSize = 0x8000;
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
        binary += String.fromCharCode(...chunk);
      }
      const base64Data = btoa(binary);
      
      // Determine MIME type
      const mimeType = fileType === "pdf" ? "application/pdf" : 
        storageUrl.toLowerCase().includes('.png') ? "image/png" :
        storageUrl.toLowerCase().includes('.webp') ? "image/webp" :
        storageUrl.toLowerCase().includes('.gif') ? "image/gif" :
        "image/jpeg";
      
      const dataUrl = `data:${mimeType};base64,${base64Data}`;
      console.log(`Converted file to base64 data URL (${mimeType}, ${base64Data.length} chars)`);

      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: `Please carefully examine this sheet music image and transcribe it to ABC notation. 

IMPORTANT: Take your time to accurately read:
1. The key signature (count the sharps or flats!)
2. The time signature
3. Each note's pitch AND duration
4. Any accidentals (sharps, flats, naturals)
5. The lyrics if present
6. Which voice parts are shown

For choral music, separate each voice part (Soprano, Alto, Tenor, Bass) into its own ABC notation section. If you can only see a single melody line, that's okay - just transcribe what's visible.

Extract the note pitches as Tone.js-compatible strings (e.g., "C4", "D#5") for each part so they can be played back.`,
          },
          {
            type: "image_url",
            image_url: { url: dataUrl },
          },
        ],
      });
    } else {
      messages.push({
        role: "user",
        content: `The user uploaded a MIDI file: ${storageUrl}. Please generate a 4-part choral arrangement in ABC notation based on typical MIDI content. Create all SATB parts.`,
      });
    }

    console.log("Calling AI gateway for music transcription...");

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages,
          tools: [
            {
              type: "function",
              function: {
                name: "save_transcription",
                description:
                  "Save the transcribed music sheet data including ABC notation for each voice part. Be thorough and accurate in the transcription.",
                parameters: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "Title of the piece as shown on the sheet music" },
                    composer: { type: "string", description: "Composer name as shown on the sheet music, or 'Unknown' if not visible" },
                    key_signature: { type: "string", description: "Key signature (e.g., 'C', 'G', 'D', 'F', 'Bb', 'Eb'). Count the sharps/flats carefully!" },
                    time_signature: { type: "string", description: "Time signature (e.g., '4/4', '3/4', '6/8', '2/4')" },
                    tempo: { type: "integer", description: "Tempo in BPM (estimate from style: hymn ~80-100, anthem ~100-120, upbeat ~120-140)" },
                    soprano_abc: { type: "string", description: "Complete ABC notation for soprano part including header (X:1, T:, K:, M:, L:, Q:)" },
                    alto_abc: { type: "string", description: "Complete ABC notation for alto part" },
                    tenor_abc: { type: "string", description: "Complete ABC notation for tenor part" },
                    bass_abc: { type: "string", description: "Complete ABC notation for bass part" },
                    soprano_notes: {
                      type: "array",
                      items: { type: "string" },
                      description: "Soprano notes as Tone.js pitches (e.g., 'C5', 'D5', 'E5'). Include octave numbers!",
                    },
                    alto_notes: {
                      type: "array",
                      items: { type: "string" },
                      description: "Alto notes as Tone.js pitches (e.g., 'A4', 'B4', 'C5')",
                    },
                    tenor_notes: {
                      type: "array",
                      items: { type: "string" },
                      description: "Tenor notes as Tone.js pitches (e.g., 'C4', 'D4', 'E4')",
                    },
                    bass_notes: {
                      type: "array",
                      items: { type: "string" },
                      description: "Bass notes as Tone.js pitches (e.g., 'C3', 'D3', 'E3')",
                    },
                  },
                  required: ["title", "key_signature", "time_signature", "tempo", "soprano_abc"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "save_transcription" } },
        }),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);

      if (aiResponse.status === 429) {
        await supabase
          .from("uploaded_sheets")
          .update({ processing_status: "failed", processing_error: "Rate limit exceeded. Please try again later." })
          .eq("id", sheetId);
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error(`AI gateway returned ${aiResponse.status}: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    console.log("AI response received:", JSON.stringify(aiData).slice(0, 500));

    // Extract tool call result
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("AI did not return structured data");
    }

    const result = JSON.parse(toolCall.function.arguments);
    console.log("Parsed transcription:", JSON.stringify(result).slice(0, 500));

    // Build parts and partNotes objects
    const parts: Record<string, string> = {};
    const partNotes: Record<string, string[]> = {};

    if (result.soprano_abc) parts.soprano = result.soprano_abc;
    if (result.alto_abc) parts.alto = result.alto_abc;
    if (result.tenor_abc) parts.tenor = result.tenor_abc;
    if (result.bass_abc) parts.bass = result.bass_abc;

    if (result.soprano_notes) partNotes.soprano = result.soprano_notes;
    if (result.alto_notes) partNotes.alto = result.alto_notes;
    if (result.tenor_notes) partNotes.tenor = result.tenor_notes;
    if (result.bass_notes) partNotes.bass = result.bass_notes;

    // Update the database record
    const { error: updateError } = await supabase
      .from("uploaded_sheets")
      .update({
        title: result.title || "Untitled",
        composer: result.composer || "Unknown",
        key_signature: result.key_signature,
        time_signature: result.time_signature,
        tempo: result.tempo,
        abc_notation: result.soprano_abc,
        parts,
        part_notes: partNotes,
        processing_status: "completed",
      })
      .eq("id", sheetId);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw new Error(`Failed to save transcription: ${updateError.message}`);
    }

    console.log(`Sheet ${sheetId} processed successfully!`);

    return new Response(
      JSON.stringify({
        success: true,
        title: result.title,
        parts: Object.keys(parts),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Processing error:", error);

    // Try to update status to failed
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      if (parsedBody?.sheetId) {
        await supabase
          .from("uploaded_sheets")
          .update({
            processing_status: "failed",
            processing_error: error instanceof Error ? error.message : "Unknown error",
          })
          .eq("id", parsedBody.sheetId);
      }
    } catch (e) {
      console.error("Failed to update error status:", e);
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown processing error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
