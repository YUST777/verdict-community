'use client';

import { useGLTF } from '@react-three/drei';
import { useEffect } from 'react';

const MODELS: string[] = [
    // '/3d/WELCOME.glb',
    // '/3d/done_approvalcamp.glb',
    // '/3d/500pts.glb',
    // '/3d/instructor.glb'
];

export default function ModelPreloader() {
    useEffect(() => {
        MODELS.forEach(path => {
            useGLTF.preload(path);
        });
    }, []);

    return null;
}
