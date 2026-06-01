import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { redis } from '@/lib/redis';

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting via Upstash Redis (3 requests per IP per day)
    // Get IP address
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    // Create a key scoped to the IP and current date
    const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const rateLimitKey = `rate_limit:${ip}:${dateStr}`;
    
    let currentLimitCount = 0;
    try {
      currentLimitCount = await redis.incr(rateLimitKey);
      if (currentLimitCount === 1) {
        await redis.expire(rateLimitKey, 86400); // Expire in 24 hours
      }
    } catch (redisErr) {
      console.error('Upstash Redis Error:', redisErr);
      // Fallback: Proceed if Redis is down/misconfigured so the user app doesn't hard crash,
      // but log it.
    }

    if (currentLimitCount > 3) {
      return NextResponse.json({ 
        success: false, 
        error: 'خلصت ليمونك النهاردة! (Rate limit exceeded) ليك 3 محاولات بس في اليوم. وفر كرامتك لبكرة يا بطل.' 
      }, { status: 429 });
    }

    // 2. Parse PDF File
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ success: false, error: 'يرجى تحميل ملف الـ CV أولاً' }, { status: 400 });
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'الملف كبير جداً! أقصى حجم مسموح به هو 2 ميجابايت' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let cvText = '';
    try {
      // @ts-ignore
      const pdfParser = require('pdf-parse');
      const parsedPdf = await pdfParser(buffer);
      cvText = parsedPdf.text || '';
    } catch (parseError: any) {
      console.error('PDF Parse Error:', parseError);
      return NextResponse.json({ 
        success: false, 
        error: 'فشلنا في قراءة ملف الـ PDF. اتأكد إنه مش صورة أو ملف محمي.' 
      }, { status: 400 });
    }

    if (!cvText.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: 'ملف الـ CV فاضي أو مقدرناش نقرأ منه كلام. جرب ترفعه بصيغة تانية مكتوبة.' 
      }, { status: 400 });
    }

    // 3. Fetch all configs from Supabase config table at once
    const { data: allConfigs, error: configError } = await supabaseAdmin
      .from('config')
      .select('key, value');

    if (configError || !allConfigs) {
      console.error('Supabase fetch error for config:', configError);
      return NextResponse.json({ 
        success: false, 
        error: 'في مشكلة في إعدادات سيرفر الـ AI. اتأكد إنك عملت الجداول في Supabase.' 
      }, { status: 500 });
    }

    const configMap = new Map<string, string>();
    allConfigs.forEach(c => configMap.set(c.key, c.value));

    // Get Active Provider and Model
    const activeProvider = configMap.get('AI_PROVIDER') || 'openrouter';
    const activeModel = configMap.get('AI_MODEL') || 'google/gemini-2.5-flash';

    // Get API Key according to the chosen active provider
    let apiKey = '';
    if (activeProvider === 'openrouter') {
      apiKey = configMap.get('OPENROUTER_API_KEY') || '';
    } else if (activeProvider === 'google') {
      apiKey = configMap.get('GEMINI_API_KEY') || '';
    } else if (activeProvider === 'groq') {
      apiKey = configMap.get('GROQ_API_KEY') || '';
    }

    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: `برجاء إضافة مفتاح الـ API الخاص بـ ${activeProvider === 'openrouter' ? 'OpenRouter' : activeProvider === 'google' ? 'Google AI Studio' : 'Groq'} في لوحة تحكم الأدمن أولاً.` 
      }, { status: 400 });
    }

    // 4. Send to Chosen AI Provider API
    const systemPrompt = `You are "الدولي HR" (The International HR) - a brutally honest, extremely sarcastic, and hilarious Egyptian HR manager.
Your job is to roast the user's CV in funny, meme-y Egyptian Arabic, and then provide a highly professional, constructive, step-by-step fix in English or Arabic (as appropriate for their CV).

You must be extremely sarcastic about their formatting, empty experiences, exaggerated skills, generic objectives, and typical corporate clichés (like "team player", "working under pressure"). Use common Egyptian slang and jokes (e.g. "يا فخر العرب", "فاخر من الآخر", "بلح", "حمادة بالجنزبيل", "الـ CV ده محتاج غسيل ومكوة").

You must respond ONLY with a JSON object in this exact format (do NOT wrap it in markdown code blocks like \`\`\`json, just return raw JSON):
{
  "roast": "Write a long, brutally honest, funny, and sarcastic Egyptian Arabic roast criticizing their CV in detail.",
  "fix": "Write a professional, encouraging, neat, step-by-step roadmap to fix the CV, offering specific alternative phrasing and formatting tips."
}`;

    let responseText = '';

    if (activeProvider === 'openrouter') {
      const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://eldawly-hr.com',
          'X-Title': 'الدولي HR',
        },
        body: JSON.stringify({
          model: activeModel || 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Here is my CV content, please roast and fix it:\n\n${cvText.substring(0, 6000)}` }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (!openRouterResponse.ok) {
        const errText = await openRouterResponse.text();
        console.error('OpenRouter API error:', errText);
        return NextResponse.json({ 
          success: false, 
          error: 'فشل في الاتصال بمزود الخدمة OpenRouter. جرب تاني أو غير المزود من لوحة التحكم.' 
        }, { status: 502 });
      }

      const aiResult = await openRouterResponse.json();
      responseText = aiResult.choices?.[0]?.message?.content || '';

    } else if (activeProvider === 'google') {
      // Direct Google Gemini API call
      let geminiModelName = activeModel || 'gemini-2.5-flash';
      if (geminiModelName.includes('/')) {
        geminiModelName = geminiModelName.split('/').pop() || geminiModelName;
      }

      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModelName}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: `${systemPrompt}\n\nHere is my CV content, please roast and fix it:\n\n${cvText.substring(0, 6000)}` }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      });

      if (!geminiResponse.ok) {
        const errText = await geminiResponse.text();
        console.error('Google Gemini API error:', errText);
        return NextResponse.json({ 
          success: false, 
          error: 'فشل في الاتصال المباشر بـ Google Gemini API. اتأكد من صحة مفتاح Gemini أو الموديل المختار.' 
        }, { status: 502 });
      }

      const aiResult = await geminiResponse.json();
      responseText = aiResult.candidates?.[0]?.content?.parts?.[0]?.text || '';

    } else if (activeProvider === 'groq') {
      // Direct Groq API call
      let groqModelName = activeModel || 'llama-3.3-70b-specdec';
      if (groqModelName.includes('/')) {
        groqModelName = groqModelName.split('/').pop() || groqModelName;
      }

      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: groqModelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Here is my CV content, please roast and fix it:\n\n${cvText.substring(0, 6000)}` }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (!groqResponse.ok) {
        const errText = await groqResponse.text();
        console.error('Groq API error:', errText);
        return NextResponse.json({ 
          success: false, 
          error: 'فشل في الاتصال المباشر بـ Groq API. اتأكد من صحة مفتاح Groq والموديل المختار.' 
        }, { status: 502 });
      }

      const aiResult = await groqResponse.json();
      responseText = aiResult.choices?.[0]?.message?.content || '';
    }

    // Parse the JSON output from the AI
    let roastResult = { roast: '', fix: '' };
    try {
      let cleanedContent = responseText.trim();
      if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/```$/, '').trim();
      }
      roastResult = JSON.parse(cleanedContent);
    } catch (parseJsonErr) {
      console.error('AI JSON Parse Error, content:', responseText);
      roastResult = {
        roast: responseText,
        fix: 'مقدرناش نقسم النص بشكل تلقائي. اقرأ الـ Roast فوق وفلتر منه النصايح بنفسك يا بطل!'
      };
    }

    // 5. Increment total_cvs_roasted in Supabase
    try {
      const { data: roastStats } = await supabaseAdmin
        .from('stats')
        .select('value')
        .eq('key', 'total_cvs_roasted')
        .maybeSingle();

      const currentRoasts = roastStats?.value ? Number(roastStats.value) : 0;
      await supabaseAdmin
        .from('stats')
        .upsert({ 
          key: 'total_cvs_roasted', 
          value: currentRoasts + 1,
          updated_at: new Date().toISOString()
        });
    } catch (statsErr) {
      console.error('Error incrementing roast stats:', statsErr);
      // Non-blocking fallback
    }

    return NextResponse.json({ 
      success: true, 
      roast: roastResult.roast, 
      fix: roastResult.fix 
    });

  } catch (err: any) {
    console.error('Global Roast API Error:', err);
    return NextResponse.json({ success: false, error: err.message || 'حدث خطأ غير متوقع' }, { status: 500 });
  }
}
