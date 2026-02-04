import { NextResponse } from 'next/server';

export const runtime = 'edge';

const SCENARIOS = [
  'a manipulative email from an ex-partner trying to reconnect',
  'a corporate press release hiding bad news behind positive spin',
  'a health supplement advertisement with pseudoscientific claims',
  'a political speech using fear and urgency to push an agenda',
  'an AI assistant subtly steering away from uncomfortable truths',
  'a cryptocurrency investment pitch with hidden risks',
  'a self-help guru selling a course with inflated promises',
  'a news article with subtle bias and emotional manipulation',
  'a tech company announcement downplaying privacy concerns',
  'a charity appeal using guilt and emotional pressure',
  'a product review that is actually sponsored content',
  'a scientific-sounding claim about a miracle cure',
  'a religious or spiritual leader using authority manipulation',
  'a MLM recruitment pitch disguised as friendship',
  'a conspiracy theory presented as "hidden truth"',
  'a workplace email from management with passive-aggressive undertones',
  'a dating app message with love-bombing tactics',
  'a financial advisor pushing unnecessary products',
  'a parent guilt-tripping their adult child',
  'an influencer promoting a product while hiding sponsorship',
];

const TACTICS_TO_USE = [
  'false urgency', 'appeal to authority', 'emotional manipulation',
  'gaslighting', 'false dichotomy', 'bandwagon effect',
  'fear mongering', 'guilt tripping', 'love bombing',
  'moving goalposts', 'strawman arguments', 'ad hominem',
  'appeal to tradition', 'sunk cost fallacy', 'scarcity tactics',
  'social proof manipulation', 'anchoring bias exploitation',
  'false equivalence', 'cherry-picking data', 'weasel words',
];

export async function GET() {
  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'XAI_API_KEY not configured' }, { status: 500 });
  }

  // Pick random scenario and tactics
  const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
  const numTactics = 2 + Math.floor(Math.random() * 3); // 2-4 tactics
  const shuffled = [...TACTICS_TO_USE].sort(() => Math.random() - 0.5);
  const selectedTactics = shuffled.slice(0, numTactics);

  const prompt = `Generate a realistic example text that demonstrates ${scenario}.

The text should:
- Be 2-3 paragraphs long (100-200 words)
- Sound completely natural and believable
- Subtly incorporate these manipulation tactics: ${selectedTactics.join(', ')}
- NOT mention that it's an example or that it contains manipulation
- Be written as if it's real communication

Just output the text itself, nothing else. No quotes, no explanation, no meta-commentary.`;

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-3-fast',
        messages: [
          {
            role: 'system',
            content: 'You are a creative writer generating realistic example texts that contain subtle manipulation tactics. Your goal is to create believable content that helps people learn to identify manipulation in real-world communications.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.9,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error?.message || 'Failed to generate example' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content?.trim();

    if (!generatedText) {
      return NextResponse.json({ error: 'No text generated' }, { status: 500 });
    }

    return NextResponse.json({
      text: generatedText,
      scenario: scenario,
    });
  } catch (error) {
    console.error('Example generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate example' },
      { status: 500 }
    );
  }
}
