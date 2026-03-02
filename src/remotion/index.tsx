import { registerRoot, Composition } from 'remotion';
import { ExplainerComposition } from '../components/mirror/video/ExplainerComposition';
import '../app/globals.css';

registerRoot(() => {
    return (
        <Composition
            id="ExplainerComposition"
            component={ExplainerComposition}
            durationInFrames={150} // 5s default
            fps={30}
            width={1920}
            height={1080}
        />
    );
});
