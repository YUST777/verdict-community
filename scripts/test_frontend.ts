async function test() {
    const reqData = {
        problemDescription: "Given an array.",
        solution: "function twoSum() {}",
        language: "javascript",
        settings: {
            apiKey: process.env.GROQ_API_KEY || "dummy",
            baseURL: "https://api.groq.com/openai/v1",
            model: "llama3-70b-8192"
        }
    };

    console.log('Fetching from local API with GROQ_API_KEY set:', process.env.GROQ_API_KEY !== undefined);
    try {
        const res = await fetch('http://localhost:3000/api/ai/video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reqData)
        });
        
        console.log('Status HTTP:', res.status);
        const text = await res.text();
        const data = JSON.parse(text);
        if (data.scenes && data.scenes.length > 0) {
            console.log('Script Length:', data.scenes[0].script?.length);
            console.log('Audio String Prefix:', data.scenes[0].audioData?.substring(0, 30));
        } else {
            console.log('Error/No scenes:', data);
        }
    } catch(e) {
        console.error('Fetch error:', e);
    }
}
test();
