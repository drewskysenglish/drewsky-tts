/* Drewsky's English - Drew voice TTS service. Key from ELEVENLABS_API_KEY env var; CORS open. */
const VOICE_ID = "ychll2alpELRiwkrD1IZ";
const MODEL = "eleven_multilingual_v2";
const MAX_CHARS = 600;
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };
exports.handler = async (event) => {
if (event.httpMethod === "OPTIONS") { return { statusCode: 204, headers: CORS, body: "" }; }
try {
const key = process.env.ELEVENLABS_API_KEY;
if (!key) { return { statusCode: 503, headers: CORS, body: "ELEVENLABS_API_KEY not set" }; }
const params = event.queryStringParameters || {};
let text = (params.t || params.text || "").toString();
if (event.httpMethod === "POST" && event.body) { try { const b = JSON.parse(event.body); if (b.text) text = b.text; } catch (e) {} }
text = text.trim().slice(0, MAX_CHARS);
if (!text) return { statusCode: 400, headers: CORS, body: "no text" };
const r = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + VOICE_ID + "?output_format=mp3_44100_128", { method: "POST", headers: { "xi-api-key": key, "Content-Type": "application/json", "Accept": "audio/mpeg" }, body: JSON.stringify({ text: text, model_id: MODEL, voice_settings: { stability: 0.5, similarity_boost: 0.85, style: 0.0, use_speaker_boost: true } }) });
if (!r.ok) { const msg = await r.text().catch(() => ""); return { statusCode: 502, headers: CORS, body: "tts upstream " + r.status + " " + msg.slice(0, 200) }; }
const buf = Buffer.from(await r.arrayBuffer());
return { statusCode: 200, headers: Object.assign({}, CORS, { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=31536000, immutable" }), body: buf.toString("base64"), isBase64Encoded: true };
} catch (e) { return { statusCode: 500, headers: CORS, body: "err: " + (e && e.message ? e.message : String(e)) }; }
};
