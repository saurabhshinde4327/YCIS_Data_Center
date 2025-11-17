"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description: string;
}

export function HeroSection({ title, subtitle, description }: HeroSectionProps) {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white">
      {/* Background Graphics */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-0 w-[140%] h-full -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-600/10 via-purple-800/10 to-transparent blur-2xl" />
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5" />
      </div>

      <div className="container relative z-10 px-4 py-20 md:py-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="space-y-6 text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight animate-fade-in">
            Empowering Your Digital Growth
          </h1>
          <div className="space-y-4 text-base md:text-lg text-slate-200 animate-fade-in delay-300">
            <p className="leading-relaxed">
              Our next-generation data center ensures <span className="text-indigo-300 font-semibold">unmatched reliability, speed, and security</span> for every hosting need.
            </p>
            <p className="leading-relaxed">
              Scale effortlessly with <span className="text-indigo-300 font-semibold">VPS, web, and cloud solutions</span> designed for businesses of all sizes.
            </p>
            <p className="leading-relaxed">
              Manage everything from one powerful dashboard — backed by <span className="text-indigo-300 font-semibold">24/7 expert support</span>.
            </p>
            <p className="text-xl font-bold text-white mt-4">
              Your success starts with smarter hosting.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 animate-fade-in delay-500">
            <Link href="/packages">
              <Button
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl shadow-xl transform transition hover:scale-105 text-base font-semibold"
              >
                Explore Packages
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="bg-white border-2 border-white text-black hover:bg-gray-100 px-8 py-4 rounded-xl shadow-md transition hover:scale-105 text-base font-semibold"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Image */}
        <div className="relative flex justify-center animate-fade-in delay-700">
          <div className="relative w-[90%] h-auto max-w-md">
            <Image
              src="/hero.png"
              alt="Data Center Illustration"
              width={500}
              height={500}
              className="w-full h-auto object-contain drop-shadow-2xl rounded-3xl"
            />
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 blur-2xl rounded-3xl" />
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        .delay-150 { animation-delay: 0.15s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-700 { animation-delay: 0.7s; }
      `}</style>
    </section>
  );
}
