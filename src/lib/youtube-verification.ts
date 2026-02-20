
import yts from 'yt-search';
import { validateLink } from './link-validator';

// 1. DEFINE YOUR TRUSTED EXPERTS (The "Accuracy" Layer)
const TRUSTED_CHANNELS = [
    "WilliamFiset",    // Graph Theory
    "Errichto",        // Competitive Programming
    "freeCodeCamp",    // Algorithm Courses
    "Reducible",       // Visualizations
    "Abdul Bari",      // Algorithm Theory
    "William Lin",     // Speed/Tricks
    "USACO Guide",     // Curriculum
    "Coding Dynamo"    // Detailed CF Solutions
];

export interface VerifiedVideo {
    title: string;
    url: string;
    source: string;
    thumbnail?: string;
    status: string;
}

/**
 * Searches trusted channels for a topic and returns the first REAL link.
 */
export async function getVerifiedVideo(topic: string): Promise<VerifiedVideo | null> {
    console.log(`🔎 Searching for verified '${topic}' guide...`);

    // Search channels in parallel or sequence? Sequence is better to prioritize top channels.
    for (const channel of TRUSTED_CHANNELS) {
        try {
            // Construct query: "Graph Theory BFS WilliamFiset"
            const query = `${topic} ${channel}`;

            // Search YouTube
            const r = await yts(query);
            const videos = r.videos;

            if (videos && videos.length > 0) {
                const video = videos[0]; // Take best match

                // 2. THE VALIDATION LAYER
                const validation = await validateLink(video.url);

                if (validation.isValid) {
                    return {
                        title: video.title,
                        url: video.url,
                        source: channel,
                        thumbnail: video.thumbnail,
                        status: "Verified & Active ✅"
                    };
                }
            }
        } catch (error) {
            console.error(`Failed search for ${channel}:`, error);
            continue;
        }
    }

    return null;
}
