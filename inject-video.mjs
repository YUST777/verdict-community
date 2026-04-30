import pg from "pg";
import { readFileSync } from "fs";

// ── Config ──────────────────────────────────────────────────────────────────
const envText = readFileSync("/home/ubuntu/verdict/.env", "utf8");
const dbUrl = envText.match(/DATABASE_URL=(.*)/)?.[1];
const ttsKey = envText.match(/GOOGLE_TTS_API_KEY=(.*)/)?.[1];

if (!dbUrl || !ttsKey) {
    console.error("Missing DATABASE_URL or GOOGLE_TTS_API_KEY in .env");
    process.exit(1);
}

const pool = new pg.Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

// ── The handcrafted Theatre Square video script ─────────────────────────────
const CODE = `#include <bits/stdc++.h>
using namespace std;
int main() {
    long long n, m, a;
    cin >> n >> m >> a;
    long long rows = (n + a - 1) / a;
    long long cols = (m + a - 1) / a;
    cout << rows * cols << endl;
    return 0;
}`;

const script = {
    title: "Theatre Square",
    scenes: [
        {
            id: "title-1",
            type: "title",
            duration: 4,
            text: "Theatre Square",
            script: "Lets solve Codeforces problem 1A, Theatre Square. A classic beginner problem about paving tiles."
        },
        {
            id: "problem-1",
            type: "problem",
            duration: 8,
            text: "Pave a rectangle with tiles",
            script: "We have a rectangular theatre square of size n by m meters. We need to pave it with square granite flagstones of size a by a meters. We must cover the entire square, and no flagstone can be broken. Find the minimum number of flagstones needed.",
            svg: '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><rect x="80" y="60" width="240" height="180" fill="none" stroke="#ffffff" stroke-width="1.5"/><text x="200" y="45" text-anchor="middle" fill="#ffffff" fill-opacity="0.6" font-size="16" font-family="monospace">N</text><text x="60" y="155" text-anchor="middle" fill="#ffffff" fill-opacity="0.6" font-size="16" font-family="monospace">M</text></svg>'
        },
        {
            id: "problem-2",
            type: "problem",
            duration: 7,
            text: "Tiles may extend beyond edges",
            script: "The key constraint is that flagstones cannot be broken. So if the square is 6 by 6 and tiles are 4 by 4, we need 2 tiles per side even though they extend beyond the edge. That gives us 4 tiles total.",
            svg: '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><rect x="100" y="70" width="150" height="150" fill="none" stroke="#ffffff" stroke-width="1.5"/><rect x="100" y="70" width="100" height="100" fill="none" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4 2"/><text x="150" y="55" text-anchor="middle" fill="#10b981" fill-opacity="0.8" font-size="14" font-family="monospace">A</text></svg>'
        },
        {
            id: "concept-1",
            type: "concept",
            duration: 8,
            text: "Ceiling division is the key",
            script: "The insight is simple. For each dimension, we need the ceiling of n divided by a tiles. In integer math, ceiling division of n by a equals n plus a minus 1, all divided by a. We apply this to both dimensions and multiply.",
            svg: '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><rect x="120" y="100" width="160" height="80" fill="none" stroke="#10b981" stroke-width="1.5" rx="6"/><text x="200" y="148" text-anchor="middle" fill="#ffffff" font-size="18" font-family="monospace">(N+A-1)/A</text></svg>'
        },
        {
            id: "code-1",
            type: "code",
            duration: 6,
            text: "Include and main setup",
            script: "We start with the standard competitive programming header and our main function. Nothing special here, just boilerplate to get us going.",
            code: CODE,
            highlight: [1, 3]
        },
        {
            id: "code-2",
            type: "code",
            duration: 7,
            text: "Read input variables",
            script: "We declare three long long variables n, m and a, then read them from standard input. We use long long because n and m can be up to one billion and their product could overflow a regular int.",
            code: CODE,
            highlight: [4, 5]
        },
        {
            id: "code-3",
            type: "code",
            duration: 8,
            text: "Compute ceiling division",
            script: "Here is the core logic. We compute the number of rows of tiles as n plus a minus 1, integer divided by a. Similarly for columns. This ceiling division formula avoids floating point entirely, which is important for precision.",
            code: CODE,
            highlight: [6, 7]
        },
        {
            id: "code-4",
            type: "code",
            duration: 6,
            text: "Output the final answer",
            script: "Finally we multiply rows by columns and output the result. The total number of flagstones is the product of tiles needed in each dimension.",
            code: CODE,
            highlight: [8, 10]
        },
        {
            id: "summary-1",
            type: "summary",
            duration: 5,
            text: "Time: O(1) | Space: O(1)",
            script: "This runs in constant time and constant space. Just three reads, two divisions, one multiplication. A clean and elegant solution to a classic problem."
        }
    ]
};

// ── Generate TTS for each scene ─────────────────────────────────────────────
async function generateTTS(text) {
    const cleanScript = text.replace(/[`*"'?\[\](){}_+]/g, "").replace(/-/g, " ");
    const res = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${ttsKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                input: { text: cleanScript },
                voice: { languageCode: "en-US", name: "en-US-Standard-A", ssmlGender: "MALE" },
                audioConfig: { audioEncoding: "MP3" }
            })
        }
    );
    if (!res.ok) {
        console.error("TTS error:", await res.text());
        return null;
    }
    const data = await res.json();
    return data.audioContent || null;
}

// Simple MP3 duration estimation from buffer
function estimateMp3Duration(base64) {
    const buf = Buffer.from(base64, "base64");
    let duration = 0;
    let offset = 0;
    const bitrateTable = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
    const sampleRateTable = [44100, 48000, 32000, 0];

    while (offset < buf.length - 4) {
        if (buf[offset] === 0xFF && (buf[offset + 1] & 0xE0) === 0xE0) {
            const bitrateIdx = (buf[offset + 2] >> 4) & 0x0F;
            const sampleRateIdx = (buf[offset + 2] >> 2) & 0x03;
            const padding = (buf[offset + 2] >> 1) & 0x01;
            const bitrate = bitrateTable[bitrateIdx] * 1000;
            const sampleRate = sampleRateTable[sampleRateIdx];

            if (bitrate > 0 && sampleRate > 0) {
                const frameSize = Math.floor((144 * bitrate) / sampleRate) + padding;
                duration += 1152 / sampleRate;
                offset += frameSize;
            } else {
                offset++;
            }
        } else {
            offset++;
        }
    }

    return duration || buf.length / 4000;
}

async function main() {
    console.log("Generating TTS for", script.scenes.length, "scenes...");

    for (const scene of script.scenes) {
        if (!scene.script) continue;
        console.log(`  TTS for ${scene.id}...`);
        const audioContent = await generateTTS(scene.script);
        if (audioContent) {
            const duration = estimateMp3Duration(audioContent);
            scene.audioData = `data:audio/mp3;base64,${audioContent}`;
            scene.duration = duration + 1.5;
            console.log(`    -> ${duration.toFixed(1)}s audio + 1.5s padding = ${scene.duration.toFixed(1)}s`);
        } else {
            console.log(`    -> TTS failed, keeping original duration ${scene.duration}s`);
        }
    }

    // Insert into video_shares
    console.log("Inserting into video_shares...");
    const res = await pool.query(
        `INSERT INTO public.video_shares (script) VALUES ($1) RETURNING id`,
        [JSON.stringify(script)]
    );
    const id = res.rows[0].id;
    console.log(`\nVideo share created!`);
    console.log(`  ID: ${id}`);
    console.log(`  URL: https://verdict.run/video/${id}`);

    await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
