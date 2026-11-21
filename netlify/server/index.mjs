import { Hono } from 'hono';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { TypeSafeClient, choice } from '@typesafe-ai/sdk';
import {
  ALL_MODELS,
  DEFAULT_MODEL_BY_HARNESS,
  MODEL_CATALOG,
  getProviderForModel,
  isImageModel,
} from '../../shared/models.mjs';
import { HARNESSES, buildSystemPrompt } from '../../shared/harnesses.mjs';
import { renderDashboardHtml } from './ui.mjs';

const app = new Hono();

let _anthropic;
let _openai;
let _gemini;
let _typesafe;

const getAnthropic = () => (_anthropic ??= new Anthropic());
const getOpenAI = () => (_openai ??= new OpenAI());
const getGemini = () => (_gemini ??= new GoogleGenAI({}));
const getTypesafe = () => (_typesafe ??= new TypeSafeClient());

function getGatewayConfig() {
  const url = (process.env.NETLIFY_AI_GATEWAY_URL || '').replace(/\/$/, '');
  const key = process.env.NETLIFY_AI_GATEWAY_KEY || '';
  return { url, key };
}

app.get('/', (c) => {
  return c.html(renderDashboardHtml());
});

app.get('/api/health', (c) => {
  const { url } = getGatewayConfig();
  return c.json({
    ok: true,
    gatewayConfigured: Boolean(url),
    totalModels: ALL_MODELS.length,
    harnesses: Object.keys(HARNESSES),
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/harnesses', (c) => {
  return c.json({ harnesses: HARNESSES });
});

app.get('/api/models', (c) => {
  const provider = c.req.query('provider');
  const q = (c.req.query('q') || '').trim().toLowerCase();

  let models = ALL_MODELS;
  if (provider && MODEL_CATALOG[provider]) {
    models = models.filter((m) => m.provider === provider);
  }
  if (q) {
    models = models.filter(
      (m) => m.id.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q),
    );
  }

  return c.json({
    total: models.length,
    providers: Object.keys(MODEL_CATALOG),
    models,
  });
});

app.post('/api/chat', async (c) => {
  try {
    const body = await c.req.json();
    const harness = HARNESSES[body.harness] ? body.harness : 'antigravity';
    const lang = body.lang === 'en' ? 'en' : 'ru';
    const model = body.model || DEFAULT_MODEL_BY_HARNESS[harness];
    const provider = getProviderForModel(model);

    if (!provider) {
      return c.json(
        { error: `Unsupported model "${model}". Query /api/models for the supported catalog.` },
        400,
      );
    }

    const rawMessages = Array.isArray(body.messages) ? body.messages : [];
    const messages = rawMessages
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .map((m) => ({ role: m.role, content: m.content }));

    if (messages.length === 0) {
      return c.json({ error: 'messages array must contain at least one message' }, 400);
    }

    const systemPrompt = buildSystemPrompt({
      harnessId: harness,
      lang,
      contextSummary: body.contextSummary || '',
    });

    if (provider === 'anthropic') {
      const msg = await getAnthropic().messages.create({
        model,
        max_tokens: body.maxTokens || 2048,
        system: systemPrompt,
        messages,
      });
      const reply = msg.content
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('\n');
      return c.json({ provider, model, harness, reply });
    }

    if (provider === 'openai') {
      if (isImageModel(model)) {
        const lastUser = messages.filter((m) => m.role === 'user').pop()?.content || '';
        const response = await getOpenAI().responses.create({
          model: 'gpt-4o',
          input: lastUser,
          tools: [{ type: 'image_generation' }],
        });
        const img = response.output?.find((item) => item.type === 'image_generation_call');
        const imageBase64 =
          typeof img?.result === 'string' ? img.result : img?.result?.data || null;
        return c.json({
          provider,
          model,
          harness,
          reply: imageBase64 ? '[Image generated via OpenAI Responses API]' : '[No image returned]',
          imageBase64,
          imageMimeType: 'image/png',
        });
      }

      const completion = await getOpenAI().chat.completions.create({
        model,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      });
      const reply = completion.choices[0]?.message?.content || '';
      return c.json({ provider, model, harness, reply });
    }

    if (provider === 'gemini') {
      if (isImageModel(model)) {
        const { url, key } = getGatewayConfig();
        if (!url || !key) {
          return c.json(
            { error: 'Netlify AI Gateway environment variables are not available in this runtime.' },
            503,
          );
        }
        const imgClient = new GoogleGenAI({
          apiKey: key,
          httpOptions: { baseUrl: url },
        });
        const lastUser = messages.filter((m) => m.role === 'user').pop()?.content || '';
        const response = await imgClient.models.generateContent({
          model,
          contents: lastUser,
        });
        const part = response.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
        return c.json({
          provider,
          model,
          harness,
          reply: part ? '[Image generated via Gemini Image model]' : response.text || '',
          imageBase64: part?.inlineData?.data || null,
          imageMimeType: part?.inlineData?.mimeType || 'image/png',
        });
      }

      const transcript = messages
        .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
        .join('\n\n');
      const response = await getGemini().models.generateContent({
        model,
        contents: `${systemPrompt}\n\n${transcript}`,
      });
      return c.json({ provider, model, harness, reply: response.text || '' });
    }

    if (provider === 'typesafe') {
      const lastUser = messages.filter((m) => m.role === 'user').pop()?.content || '';
      const { answers } = await getTypesafe().systemOne({
        model,
        state: lastUser,
        questions: {
          intent: choice('Classify the developer request', {
            coding: 'Writing or editing code',
            debugging: 'Fixing an error or bug',
            architecture: 'Planning or system design',
            other: null,
          }),
        },
      });
      return c.json({
        provider,
        model,
        harness,
        reply: JSON.stringify(answers, null, 2),
      });
    }

    if (provider === 'openrouter' || provider === 'meta') {
      const { url, key } = getGatewayConfig();
      if (!url || !key) {
        return c.json(
          { error: 'Netlify AI Gateway environment variables are not available in this runtime.' },
          503,
        );
      }
      const routePrefix = provider === 'meta' ? 'meta' : 'openrouter';
      const upstream = await fetch(`${url}/${routePrefix}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
        }),
      });
      const data = await upstream.json();
      if (!upstream.ok) {
        return c.json({ error: data.error?.message || `Upstream ${upstream.status}` }, upstream.status);
      }
      const reply = data.choices?.[0]?.message?.content || '';
      return c.json({ provider, model, harness, reply });
    }

    return c.json({ error: `Unhandled provider: ${provider}` }, 400);
  } catch (err) {
    return c.json({ error: err?.message || 'Internal server error' }, 500);
  }
});

export default app;
