import mp3Duration from 'mp3-duration';

async function test() {
    console.log('Testing mp3-duration import:', typeof mp3Duration);

    const reqData = {
        problemDescription: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        solution: "function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if (map.has(complement)) return [map.get(complement), i]; map.set(nums[i], i); } }",
        language: "javascript",
        settings: {
            apiKey: process.env.GROQ_API_KEY || "test_key",
            baseURL: "https://api.groq.com/openai/v1",
            model: "llama3-70b-8192"
        }
    };

    console.log('Fetching from local API...');
    try {
        const res = await fetch('http://127.0.0.1:3002/api/ai/video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reqData)
        });

        console.log('Status:', res.status);
        const text = await res.text();

        if (!res.ok) {
            console.error('API Error:', text);
            return;
        }

        const data = JSON.parse(text);
        console.log('Scenes count:', data.scenes?.length);

        if (data.scenes && data.scenes.length > 0) {
            const firstScene = data.scenes[0];
            console.log('First scene duration:', firstScene.duration);
            console.log('First scene has audioData:', !!firstScene.audioData);
            if (firstScene.audioData) {
                console.log('Audio Data length:', firstScene.audioData.length);
            }

            // Log missing audio segments
            let missingAudio = 0;
            for (const s of data.scenes) {
                if (s.script && !s.audioData) {
                    missingAudio++;
                }
            }
            if (missingAudio > 0) console.log('WARNING: Scenes with scripts but missing audioData:', missingAudio);
        }

    } catch (e) {
        console.error('Fetch failed:', e);
    }
}

test();
