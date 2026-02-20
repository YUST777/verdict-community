'use client';


import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Float, OrbitControls, Center, Html } from '@react-three/drei';
import * as THREE from 'three';
import Loader from './Loader';

interface ModelProps {
    path: string;
    scale?: number;
    unlocked?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Model({ path, scale = 1, unlocked: _unlocked = true }: ModelProps) {
    const { scene } = useGLTF(path);
    // Clone scene to avoid mutating the shared cache
    const clone = useMemo(() => scene.clone(), [scene]);
    const ref = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (ref.current) {
            // Gentle rotation
            ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
        }
    });

    return (
        <group ref={ref}>
            <primitive object={clone} scale={scale} />
        </group>
    );
}

interface Badge3DProps {
    modelPath: string;
    unlocked?: boolean;
    scale?: number;
}

export default function Badge3D({ modelPath, unlocked = true, scale = 2 }: Badge3DProps) {
    return (
        <div className={`w-full h-full min-h-[160px] relative ${!unlocked ? 'blur-sm grayscale opacity-60' : ''}`}>
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
                <ambientLight intensity={1.5} />
                <spotLight position={[10, 10, 10]} angle={0.25} penumbra={1} intensity={2} />
                <pointLight position={[-10, -10, -10]} intensity={1} />

                <Suspense fallback={
                    <Html center>
                        <Loader />
                    </Html>
                }>
                    <Float
                        speed={2}
                        rotationIntensity={0.5}
                        floatIntensity={0.5}
                        floatingRange={[-0.1, 0.1]}
                    >
                        <Center>
                            <Model path={modelPath} scale={scale * 1.45} unlocked={unlocked} />
                        </Center>
                    </Float>
                    <Environment preset="city" />
                    <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 1.5} />
                </Suspense>
            </Canvas>
        </div>
    );
}
