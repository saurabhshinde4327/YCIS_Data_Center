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
    <section className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden">
      {/* Background with Gradient and Subtle Pattern */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900">
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath fill=%22%23ffffff%22 opacity=%22.1%22 d=%22M0 0h60v60H0z%22/%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%223%22 fill=%22%23ffffff%22/%3E%3C/svg%3E')] bg-repeat" />
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Text Content */}
          <div className="space-y-6 text-center lg:text-left">
            <h1 
              className="text-3xl font-extrabold tracking-tight sm:text-2xl md:text-3xl lg:text-3xl text-white drop-shadow-lg animate-slide-up"
            >
              {title}
            </h1>
            {subtitle && (
              <h2 
                className="text-lg font-medium sm:text-xl md:text-1xl text-indigo-200 animate-slide-up delay-100"
              >
                {subtitle}
              </h2>
            )}
            <p 
              className="text-base sm:text-lg text-gray-200 max-w-md mx-auto lg:mx-0 animate-slide-up delay-200"
            >
              {description}
            </p>
            <ul 
              className="space-y-3 text-base sm:text-lg text-gray-200 animate-slide-up delay-300"
            >
              <li className="flex items-center justify-center lg:justify-start">
                <svg className="w-6 h-6 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Premium Technical Support
              </li>
              <li className="flex items-center justify-center lg:justify-start">
                <svg className="w-6 h-6 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Seamless Website Migration
              </li>
              <li className="flex items-center justify-center lg:justify-start">
                <svg className="w-6 h-6 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                24/7 Dedicated Customer Support
              </li>
            </ul>
            <div 
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4 animate-slide-up delay-400"
            >
              <Link href="/packages">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Explore Packages
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-blue border-white hover:bg-white hover:text-indigo-900 transition-all duration-300 shadow-lg"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Side - Image */}
          <div 
            className="relative flex justify-center animate-slide-left"
          >
            <Image
              src="/hero.png"
              alt="Data Center Team"
              width={500}
              height={500}
              className="object-contain drop-shadow-2xl"
            />
            {/* Floating Glow Effect */}
            <div className="absolute inset-0 z-[-1] bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-full blur-3xl animate-float" />
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-left {
          0% { opacity: 0; transform: translateX(50px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }
        .animate-slide-left {
          animation: slide-left 1s ease-out forwards;
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
      `}</style>
    </section>
  );
}