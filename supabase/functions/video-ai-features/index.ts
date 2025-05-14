
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAiApiKey = Deno.env.get('OPENAI_API_KEY');

// CORS headers for the function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

// Generate tags from text content
async function generateTags(text: string): Promise<string[]> {
  if (!openAiApiKey) {
    console.error('OpenAI API key not found');
    return [];
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a hashtag generation assistant. Extract 3-5 relevant hashtags from the given text. Return only a JSON array of hashtag strings without the # symbol. Be concise and relevant.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected response format from OpenAI:', data);
      return [];
    }

    // Try to parse the content as JSON array
    try {
      const content = data.choices[0].message.content.trim();
      // Handle cases where the AI returns JSON with surrounding text
      const jsonMatch = content.match(/\[.*\]/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      // Direct parsing if it's a clean array
      return JSON.parse(content);
    } catch (error) {
      console.error('Error parsing tags from AI response:', error);
      // Fallback: extract words that look like tags
      const text = data.choices[0].message.content;
      return text.match(/\b\w+\b/g)?.slice(0, 5) || [];
    }
  } catch (error) {
    console.error('Error generating tags:', error);
    return [];
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { feature, data } = await req.json();
    
    // Transcript generation from audio
    if (feature === 'transcript' && data.audio) {
      if (!openAiApiKey) {
        throw new Error('OpenAI API key not configured.');
      }
      
      // Process audio in chunks
      const binaryAudio = processBase64Chunks(data.audio);
      
      // Prepare form data
      const formData = new FormData();
      const blob = new Blob([binaryAudio], { type: 'audio/webm' });
      formData.append('file', blob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');

      // Send to OpenAI Whisper
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAiApiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${errorText}`);
      }

      const result = await response.json();
      const transcript = result.text;
      
      // Generate tags based on transcript
      const tags = await generateTags(transcript);

      return new Response(
        JSON.stringify({ transcript, tags }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Generate tags from text content
    if (feature === 'generate-tags' && data.text) {
      const tags = await generateTags(data.text);
      
      return new Response(
        JSON.stringify({ tags }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error(`Unknown feature: ${feature}`);

  } catch (error) {
    console.error('Error in video-ai-features function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
