import axios from 'axios';

const GEMINI_URL = process.env.EXPO_PUBLIC_GEMINI_API_URL ||
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';
const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const IMAGE_URL  = process.env.EXPO_PUBLIC_IMAGE_API_URL  || 'https://image.pollinations.ai/prompt/';
const VOICERSS_KEY = process.env.EXPO_PUBLIC_VOICERSS_API_KEY || '';
const VOICERSS_URL = process.env.EXPO_PUBLIC_VOICERSS_API_URL || 'https://api.voicerss.org/';
const NEWS_KEY   = process.env.EXPO_PUBLIC_NEWS_API_KEY   || '';
const NEWS_URL   = process.env.EXPO_PUBLIC_NEWS_API_URL   || 'https://newsapi.org/v2/top-headlines';
const UNSPLASH_KEY = process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY || '';
const UNSPLASH_URL = process.env.EXPO_PUBLIC_UNSPLASH_API_URL    || 'https://api.unsplash.com';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const geminiPost = async (prompt, maxTokens = 2048, temp = 0.9) => {
  if (!GEMINI_KEY) throw new Error('Gemini API key not set. Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.');
  const url = `${GEMINI_URL}?key=${GEMINI_KEY}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: temp, maxOutputTokens: maxTokens },
  };
  const res = await axios.post(url, body, { timeout: 30000 });
  return res.data.candidates[0].content.parts[0].text;
};

// ─── Text Generation ──────────────────────────────────────────────────────────
export const generateText = (prompt) => geminiPost(prompt);

// ─── Slides Generation ───────────────────────────────────────────────────────
export const generateSlides = async (topic) => {
  const prompt = `Create a 5-slide presentation about: "${topic}".
Return ONLY valid JSON (no markdown, no explanation):
{"title":"...","slides":[{"title":"...","content":"...","bulletPoints":["...","...","..."]}]}`;
  const raw = await geminiPost(prompt, 2048, 0.7);
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('JSON Parse Error:', e, raw);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error('Failed to parse AI response as JSON');
  }
};

// ─── Video Script Generation ─────────────────────────────────────────────────
export const generateVideoScript = async (topic) => {
  const prompt = `Create a short video script about: "${topic}".
Return ONLY valid JSON (no markdown):
{"title":"...","duration":"2 minutes","scenes":[{"scene":1,"title":"...","description":"...","narration":"...","duration":"30s"}]}`;
  const raw = await geminiPost(prompt, 2048, 0.8);
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('JSON Parse Error:', e, raw);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error('Failed to parse AI response as JSON');
  }
};

// ─── Image Generation (Pollinations.ai — Free, no key) ───────────────────────
export const generateImageUrl = (prompt) => {
  const encoded = encodeURIComponent(prompt);
  const seed = Math.floor(Math.random() * 99999);
  return `${IMAGE_URL}${encoded}?width=768&height=512&seed=${seed}&nologo=true&model=flux`;
};

// ─── Audio (VoiceRSS) ────────────────────────────────────────────────────────
export const generateAudioUrl = (text) => {
  if (!VOICERSS_KEY) return null;
  const params = new URLSearchParams({
    key: VOICERSS_KEY,
    src: text.substring(0, 500),
    hl: 'en-us',
    v: 'Mary',
    r: '0',
    c: 'mp3',
    f: '44khz_16bit_stereo',
  });
  return `${VOICERSS_URL}?${params.toString()}`;
};

// ─── News ────────────────────────────────────────────────────────────────────
export const fetchNews = async (query = '') => {
  if (!NEWS_KEY) throw new Error('NewsAPI key not set. Add EXPO_PUBLIC_NEWS_API_KEY to .env');
  const params = { country: 'us', apiKey: NEWS_KEY, pageSize: 20 };
  if (query) { params.q = query; delete params.country; }
  const res = await axios.get(NEWS_URL, { params, timeout: 15000 });
  return res.data.articles;
};

// ─── Unsplash ────────────────────────────────────────────────────────────────
export const searchImages = async (query) => {
  if (!UNSPLASH_KEY) throw new Error('Unsplash key not set. Add EXPO_PUBLIC_UNSPLASH_ACCESS_KEY to .env');
  const res = await axios.get(`${UNSPLASH_URL}/search/photos`, {
    params: { query, per_page: 20, orientation: 'landscape' },
    headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
    timeout: 15000,
  });
  return res.data.results;
};
