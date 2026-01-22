'use client';

import { useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Direct imports instead of barrel (bundle-barrel-imports rule)
import Navbar from './components/landing/Navbar';
import HeroSection from './components/landing/HeroSection';
import Footer from './components/landing/Footer';

// Dynamic imports for heavy below-fold components (bundle-dynamic-imports rule)
const PreviewWidget = dynamic(() => import('./components/landing/PreviewWidget'), {
  ssr: true,
  loading: () => <div className="min-h-[600px] animate-pulse bg-white/5 rounded-3xl" />
});

const PoweredBy = dynamic(() => import('./components/landing/PoweredBy'), {
  ssr: true
});

const Roadmap = dynamic(() => import('./components/landing/Roadmap'), {
  ssr: true
});

const FAQ = dynamic(() => import('./components/landing/FAQ'), {
  ssr: true
});

export default function VerdictLanding() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoEnd = useCallback(() => {
    if (videoRef.current) {
      // Safety check for video duration (js-early-exit rule)
      const duration = videoRef.current.duration;
      if (!duration || duration < 2) {
        videoRef.current.currentTime = 0;
      } else {
        videoRef.current.currentTime = 2; // Loop from 2s mark
      }
      videoRef.current.play();
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <Navbar />
      {/* Hero + Preview Container with Video Background */}
      <div className="relative w-full">
        {/* Video Background - Extended to cover hero + part of preview */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
          className="absolute top-0 left-0 w-full h-[240vh] object-cover"
        >
          <source src="/videos/huly_laser.webm" type="video/webm" />
        </video>

        {/* Dark Overlay - Full coverage */}
        <div className="absolute top-0 left-0 w-full h-[240vh] bg-black/60 pointer-events-none z-[1]" />

        {/* Bottom Gradient Fade to Black - Much longer transition */}
        <div className="absolute top-[20vh] left-0 w-full h-[220vh] bg-gradient-to-b from-transparent via-[#0a0a0a]/40 via-[#0a0a0a]/80 to-[#0a0a0a] pointer-events-none z-[2]" />

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <HeroSection />
        </div>

        {/* Preview Widget - Inside video container */}
        <div className="relative z-10">
          <PreviewWidget />
        </div>
      </div>

      <PoweredBy />
      <Roadmap />
      <FAQ />
      <Footer />
    </div>
  );
}
