import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const taskInstructions: Record<string, string> = {
  summary: 'لخّص الدرس باللغة التي يحددها المستخدم. استخدم عناوين واضحة ونقاطًا مركزة، ثم أضف أهم المصطلحات وخلاصة قصيرة. لا تخترع معلومات غير موجودة في النص.',
  quiz: 'أنشئ 8 أسئلة تدريبية مبنية فقط على محتوى الدرس. نوّع بين الاختيار من متعدد والصح والخطأ والأسئلة القصيرة. ضع الإجابات الصحيحة مع تفسير مختصر في قسم منفصل في النهاية حتى يستطيع الطالب المحاولة أولًا.',
  explain: 'اشرح الدرس للطالب بأسلوب بسيط ومتدرج، مع مثال عملي وتشبيه عند فائدته، ثم اطرح 3 أسئلة للتأكد من الفهم. لا تضف حقائق غير مدعومة بمحتوى الدرس إلا إذا وسمتها بوضوح كشرح إضافي.',
  flashcards: 'حوّل الدرس إلى 10 بطاقات مراجعة بصيغة سؤال ثم جواب، وركّز على التعريفات والقوانين والأفكار الأساسية. استخدم ترقيمًا واضحًا.',
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const task = String(body.task || 'summary');
    const content = String(body.content || '').trim();
    const language = String(body.language || 'العربية');
    if (!taskInstructions[task]) return NextResponse.json({ error: 'نوع العملية غير مدعوم.' }, { status: 400 });
    if (content.length < 30) return NextResponse.json({ error: 'أضف نصًا أطول قليلًا حتى أتمكن من مساعدتك.' }, { status: 400 });
    if (content.length > 50000) return NextResponse.json({ error: 'النص طويل جدًا. قسّمه إلى أجزاء لا تتجاوز 50,000 حرف.' }, { status: 413 });
    const key = process.env.OPENAI_API_KEY;
    if (!key) return NextResponse.json({ error: 'لم يتم إعداد مفتاح الذكاء الاصطناعي بعد. أضف OPENAI_API_KEY في إعدادات المشروع على Vercel، أو في ملف .env.local للتشغيل المحلي.' }, { status: 503 });

    const prompt = `${taskInstructions[task]}\n\nلغة الإجابة: ${language}.\nمستوى الشرح: مناسب للطلاب.\n\nمحتوى الدرس:\n${content}`;
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4.1-mini', input: prompt }),
    });
    const data = await response.json();
    if (!response.ok) {
      const message = data?.error?.message || 'تعذر الاتصال بخدمة الذكاء الاصطناعي.';
      return NextResponse.json({ error: message }, { status: response.status === 401 ? 502 : 500 });
    }
    const output = (data.output || []).flatMap((item: any) => item.content || []).filter((item: any) => item.type === 'output_text').map((item: any) => item.text).join('\n');
    if (!output) return NextResponse.json({ error: 'لم تصل إجابة من النموذج. حاول مرة أخرى.' }, { status: 502 });
    return NextResponse.json({ result: output });
  } catch {
    return NextResponse.json({ error: 'حدث خطأ غير متوقع. تحقق من الاتصال ثم حاول مجددًا.' }, { status: 500 });
  }
}
