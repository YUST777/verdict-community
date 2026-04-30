import { query } from '@/lib/db';
import { notFound } from 'next/navigation';
import ClientPage from './ClientPage';
import { VideoScript } from '@/components/mirror/video/ExplainerComposition';

export const metadata = {
    title: 'Verdict Video Walkthrough',
    description: 'Learn via AI-generated animated explanations.',
};

type Props = {
    params: Promise<{ id: string }>
}

export default async function VideoSharePage({ params }: Props) {
    const resolvedParams = await params;

    // Ensure id looks somewhat like a UUID
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resolvedParams.id)) {
        return notFound();
    }

    let script: VideoScript | null = null;
    try {
        const result = await query('SELECT script FROM public.video_shares WHERE id = $1', [resolvedParams.id]);
        if (result.rows.length === 0) {
            return notFound();
        }
        script = result.rows[0].script as VideoScript;
    } catch (err) {
        console.error("Failed to load video", err);
        return notFound();
    }
    if (!script) return notFound();
    return <ClientPage script={script} />;
}
