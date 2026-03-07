import React, { useState } from 'react';
import { useTheme } from '../providers/ThemeProvider';

const BAGLE_API = 'https://bagle-api.fly.dev';

export default function DocsPage() {
  const { isDark } = useTheme();
  const dark = isDark;
  const [tryResult, setTryResult] = useState(null);
  const [tryLoading, setTryLoading] = useState(false);

  const bg = dark ? '#0a0a0a' : '#fafafa';
  const cardBg = dark ? '#141414' : '#fff';
  const border = dark ? '#222' : '#e5e5e5';
  const text = dark ? '#e0e0e0' : '#1a1a1a';
  const muted = dark ? '#888' : '#666';
  const accent = '#4ade80';
  const codeBg = dark ? '#1a1a2e' : '#f0f0f8';
  const codeText = dark ? '#a5b4fc' : '#4338ca';

  async function tryEncode() {
    setTryLoading(true);
    try {
      const features = Array.from({ length: 100 }, (_, i) => Math.sin(i * 0.1) * 100);
      const res = await fetch(`${BAGLE_API}/api/v1/encode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features }),
      });
      const data = await res.json();
      setTryResult(data);
    } catch (err) {
      setTryResult({ error: err.message });
    } finally {
      setTryLoading(false);
    }
  }

  return (
    <div style={{ background: bg, minHeight: '100vh', color: text, padding: '40px 20px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
          BAGLE API Documentation
        </h1>
        <p style={{ fontSize: 16, color: muted, marginBottom: 32 }}>
          Encode any biosignal into 128 universal coefficients. 512 bytes. Every time.
        </p>

        {/* Quick Start */}
        <Section title="Quick Start" cardBg={cardBg} border={border}>
          <CodeBlock bg={codeBg} color={codeText}>{`curl -X POST ${BAGLE_API}/api/v1/encode \\
  -H "Content-Type: application/json" \\
  -d '{"features": [1.2, 3.4, 5.6, 7.8, 9.0]}'`}</CodeBlock>
          <p style={{ fontSize: 14, color: muted, marginTop: 12 }}>
            Response: <code style={{ color: accent }}>{'{ encoding: number[128], dim: 128, latency_ms: 3 }'}</code>
          </p>
        </Section>

        {/* Try It */}
        <Section title="Try It Now" cardBg={cardBg} border={border}>
          <p style={{ fontSize: 14, color: muted, marginBottom: 12 }}>
            Click to encode 100 sine wave samples against the live API:
          </p>
          <button
            onClick={tryEncode}
            disabled={tryLoading}
            style={{
              background: '#2563eb', color: '#fff', border: 'none',
              padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {tryLoading ? 'Encoding...' : 'Encode 100 Samples → 128 Coefficients'}
          </button>
          {tryResult && (
            <CodeBlock bg={codeBg} color={codeText} style={{ marginTop: 12 }}>
              {tryResult.error
                ? `Error: ${tryResult.error}`
                : `dim: ${tryResult.dim}\nlatency: ${tryResult.latency_ms}ms\nencoding: [${tryResult.encoding.slice(0, 5).map(v => v.toFixed(3)).join(', ')}, ... ${tryResult.encoding.length - 5} more]`}
            </CodeBlock>
          )}
        </Section>

        {/* Endpoints */}
        <Section title="Endpoints" cardBg={cardBg} border={border}>
          <EndpointRow
            method="POST" path="/api/v1/encode"
            desc="Encode any numeric array into 128 GLE coefficients"
            body='{ "features": number[] }'
            response='{ "encoding": number[128], "dim": 128, "modality": string, "latency_ms": number }'
            codeBg={codeBg} codeText={codeText} muted={muted}
          />
          <div style={{ borderTop: `1px solid ${border}`, margin: '16px 0' }} />
          <EndpointRow
            method="POST" path="/api/v1/similarity"
            desc="Cosine similarity between two encodings"
            body='{ "encoding_a": number[128], "encoding_b": number[128] }'
            response='{ "similarity": 0.0-1.0, "distance": number }'
            codeBg={codeBg} codeText={codeText} muted={muted}
          />
          <div style={{ borderTop: `1px solid ${border}`, margin: '16px 0' }} />
          <EndpointRow
            method="GET" path="/health"
            desc="Check API status and loaded models"
            body={null}
            response='{ "status": "healthy", "model_loaded": true, "models": {...} }'
            codeBg={codeBg} codeText={codeText} muted={muted}
          />
        </Section>

        {/* SDK */}
        <Section title="JavaScript SDK" cardBg={cardBg} border={border}>
          <CodeBlock bg={codeBg} color={codeText}>{`npm install @paragon-dao/bagle-sdk`}</CodeBlock>
          <CodeBlock bg={codeBg} color={codeText} style={{ marginTop: 12 }}>{`import { BagleClient } from '@paragon-dao/bagle-sdk';

const client = new BagleClient();

// Encode any signal
const result = await client.encode([1.2, 3.4, 5.6, ...]);
console.log(result.encoding); // 128 numbers

// Compare two encodings
const sim = await client.similarity(encodingA, encodingB);
console.log(sim.similarity); // 0.0 to 1.0`}</CodeBlock>
        </Section>

        {/* Offline */}
        <Section title="Offline Encoding" cardBg={cardBg} border={border}>
          <p style={{ fontSize: 14, color: muted, marginBottom: 12 }}>
            For privacy-sensitive apps, encode on-device without any network call:
          </p>
          <CodeBlock bg={codeBg} color={codeText}>{`import { gleEncodeSignal, cosineSimilarity } from '@paragon-dao/bagle-sdk';

// Runs locally — DCT-II transform, no API call
const coefficients = gleEncodeSignal(samples);
const score = cosineSimilarity(a, b);`}</CodeBlock>
        </Section>

        {/* What Can You Encode */}
        <Section title="What Can You Encode?" cardBg={cardBg} border={border}>
          <p style={{ fontSize: 14, color: muted, marginBottom: 16 }}>
            The encoder is signal-agnostic. It only sees numbers. Every phone sensor produces a time-series.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              ['Breathing audio', 'Phone mic'],
              ['Heart rate', 'Camera PPG'],
              ['Gait pattern', 'Accelerometer'],
              ['Tremor', 'Gyroscope'],
              ['Typing rhythm', 'Keyboard'],
              ['EEG', 'MUSE headband'],
              ['Sleep quality', 'Motion + mic'],
              ['Stress level', 'HRV + breathing'],
            ].map(([signal, source]) => (
              <div key={signal} style={{
                padding: 8, background: codeBg, borderRadius: 6, fontSize: 13,
              }}>
                <span style={{ fontWeight: 600 }}>{signal}</span>
                <span style={{ color: muted }}> — {source}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Template */}
        <Section title="Build an App" cardBg={cardBg} border={border}>
          <CodeBlock bg={codeBg} color={codeText}>{`git clone https://github.com/paragon-dao/gle-app-template.git my-app
cd my-app
npm install
npm run dev`}</CodeBlock>
          <p style={{ fontSize: 14, color: muted, marginTop: 12 }}>
            Clone → install → build. Your app connects to the BAGLE API and the ParagonDAO network.
            Swap the sensor hook for any signal type. Deploy as a PWA.
          </p>
        </Section>

        <p style={{ textAlign: 'center', fontSize: 12, color: muted, marginTop: 40 }}>
          Base URL: {BAGLE_API} · Encoding: 128 coefficients · Transport: 512 bytes · Latency: ~3ms
        </p>
      </div>
    </div>
  );
}

function Section({ title, children, cardBg, border }) {
  return (
    <div style={{
      background: cardBg, border: `1px solid ${border}`,
      borderRadius: 12, padding: 20, marginBottom: 16,
    }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{title}</h2>
      {children}
    </div>
  );
}

function CodeBlock({ children, bg, color, style = {} }) {
  return (
    <pre style={{
      background: bg, color, padding: 12, borderRadius: 8,
      fontSize: 13, fontFamily: 'monospace', overflowX: 'auto',
      whiteSpace: 'pre-wrap', wordBreak: 'break-word', ...style,
    }}>
      {children}
    </pre>
  );
}

function EndpointRow({ method, path, desc, body, response, codeBg, codeText, muted }) {
  const methodColor = method === 'POST' ? '#f59e0b' : '#4ade80';
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{
          background: methodColor, color: '#000', padding: '2px 8px',
          borderRadius: 4, fontSize: 11, fontWeight: 700,
        }}>{method}</span>
        <code style={{ fontSize: 14, fontWeight: 600 }}>{path}</code>
      </div>
      <p style={{ fontSize: 13, color: muted, marginBottom: 8 }}>{desc}</p>
      {body && (
        <div style={{ marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: muted }}>Body: </span>
          <code style={{ fontSize: 12, background: codeBg, color: codeText, padding: '2px 6px', borderRadius: 4 }}>{body}</code>
        </div>
      )}
      <div>
        <span style={{ fontSize: 11, color: muted }}>Response: </span>
        <code style={{ fontSize: 12, background: codeBg, color: codeText, padding: '2px 6px', borderRadius: 4 }}>{response}</code>
      </div>
    </div>
  );
}
