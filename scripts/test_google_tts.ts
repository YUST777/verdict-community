import mp3Duration from 'mp3-duration';

async function test() {
    const ttsApiKey = process.env.GOOGLE_TTS_API_KEY;
    console.log('Testing with API key:', ttsApiKey ? 'SET' : 'NOT SET');
    
    const ttsRes = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${ttsApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            input: { text: "Hello, this is a test of the text to speech." },
            voice: { languageCode: 'en-US', name: 'en-US-Standard-A', ssmlGender: 'MALE' },
            audioConfig: { audioEncoding: 'MP3' }
        })
    });

    if (ttsRes.ok) {
        const data = await ttsRes.json();
        console.log('Got audio content, length:', data.audioContent?.length);
        if (data.audioContent) {
            const buffer = Buffer.from(data.audioContent, 'base64');
            const exactDuration = await mp3Duration(buffer);
            console.log('Exact duration:', exactDuration);
        }
    } else {
        console.error('API Error:', await ttsRes.text());
    }
}
test();
