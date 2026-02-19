"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type IconProps = React.SVGProps<SVGSVGElement>;

const ICONS = {
    notFound: (props?: IconProps) => (
        <svg
            {...props}
            width="761"
            height="301"
            viewBox="0 0 761 301"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M0.596592 241.023V199.119L124.034 4.0909H158.977V63.75H137.67L54.5739 195.426V197.699H226.875V241.023H0.596592ZM139.375 295V228.239L139.943 209.489V4.0909H189.659V295H139.375ZM379.787 300.54C356.397 300.54 336.321 294.621 319.560 282.784C302.893 270.852 290.062 253.665 281.065 231.222C272.164 208.684 267.713 181.553 267.713 149.83C267.808 118.106 272.306 91.1174 281.207 68.8636C290.204 46.5151 303.035 29.4697 319.702 17.7273C336.463 5.98484 356.491 0.113626 379.787 0.113626C403.082 0.113626 423.111 5.98484 439.872 17.7273C456.634 29.4697 469.465 46.5151 478.366 68.8636C487.363 91.2121 491.861 118.201 491.861 149.83C491.861 181.648 487.363 208.826 478.366 231.364C469.465 253.807 456.634 270.947 439.872 282.784C423.205 294.621 403.177 300.54 379.787 300.54ZM379.787 256.08C397.969 256.08 412.315 247.131 422.827 229.233C433.433 211.241 438.736 184.773 438.736 149.83C438.736 126.723 436.321 107.311 431.491 91.5909C426.662 75.8712 419.844 64.0341 411.037 56.0795C402.230 48.0303 391.813 44.0057 379.787 44.0057C361.700 44.0057 347.401 53.0019 336.889 70.9943C326.378 88.892 321.075 115.170 320.980 149.83C320.885 173.030 323.205 192.538 327.940 208.352C332.770 224.167 339.588 236.098 348.395 244.148C357.202 252.102 367.666 256.080 379.787 256.08ZM533.800 241.023V199.119L657.237 4.0909H692.180V63.75H670.874L587.777 195.426V197.699H760.078V241.023H533.800ZM672.578 295V228.239L673.146 209.489V4.0909H722.862V295H672.578Z"
                fill="currentColor"
            />
        </svg>
    ),
};

const Logo = () => (
    <Link href="/" className="absolute z-50 top-8 left-8 flex items-center gap-2 hover:opacity-80 transition-opacity">
        <Image
            src="/apple-touch-icon.png"
            alt="Sast Logo"
            width={28}
            height={28}
            className="size-7"
        />
        <span className="text-lg font-bold tracking-tight">Sast</span>
    </Link>
)

export function NotFound() {
    const router = useRouter()

    return (
        <div className="h-screen w-full flex items-center justify-center py-16 px-4 md:py-24 md:px-20 relative">
            <Logo />
            <div className="absolute hidden md:flex inset-0 items-center justify-center text-secondary py-24 px-20">
                {ICONS.notFound()}
            </div>

            <div className="z-10 flex flex-col items-center justify-center gap-8 md:gap-12">
                <div className="flex flex-col items-center justify-center gap-4 md:gap-6">
                    <h1 className="text-center text-2xl md:text-4xl font-semibold">
                        We lost this page
                    </h1>
                    <p className="text-center text-lg md:text-xl">
                        The page you are looking for doesn&apos;t exist or has been moved.{" "}
                    </p>
                </div>

                <div className="flex gap-3 flex-col md:flex-row w-full items-center justify-center">
                    <Button
                        onClick={() => router.back()}
                        className="w-full md:w-fit"
                        size="lg"
                        variant="outline"
                    >
                        Go Back
                    </Button>
                </div>
            </div>
        </div>
    );
}
