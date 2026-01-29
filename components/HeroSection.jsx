"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const HeroSection = () => {
  return (
    <>
      <style>
        {`
          @import url("https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");

          *{
            font-family: "Poppins", sans-serif;
          }
        `}
      </style>

 <section className="flex flex-col items-center bg-linear-to-b from-[#D9D9FF] to-[#F8F3F9] px-4 py-4">
        {/* Badge */}
        <div className="flex flex-wrap items-center justify-center gap-2 pl-2 pr-4 py-1.5 mt-30 rounded-full bg-white/50 border border-white">
          <div className="relative flex size-3.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping duration-300"></span>
            <span className="relative inline-flex size-2 rounded-full bg-green-600"></span>
          </div>
          <p className="text-sm text-black/60">
            Join 12,450+ brands growing with us
          </p>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-[66px]/19 text-center max-w-2xl mt-8 text-gray-800 bg-clip-text leading-tight font-medium">
          Websites built to perform beautifully.
        </h1>

        {/* Sub text */}
        <p className="text-sm text-gray-600 text-center max-w-[630px] mt-4">
          We design high-impact websites that convert and scale. From sleek
          interfaces to full stack experiences, we bring your brand to life
          online.
        </p>

        {/* Buttons with Next Link */}
        <div className="flex gap-3 mt-10">
          <Link
            href="/get-started"
            className="inline-block bg-violet-600 hover:bg-violet-700 text-white text-xs md:text-sm px-6 py-3 rounded-lg transition cursor-pointer"
          >
            Get Started Now
          </Link>

          <Link
            href="/demo"
            className="inline-block bg-white hover:bg-white/5 border border-violet-400 text-gray-600 text-xs md:text-sm px-5 py-3 rounded-lg transition cursor-pointer"
          >
            Book a demo
          </Link>
        </div>

        {/* Divider */}
        <div className="w-full max-w-[800px] h-[3px] mt-10 bg-linear-to-r from-white/10 via-violet-600 to-white/10"></div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-18 max-w-[930px] w-full">
          <div className="text-center">
            <h2 className="font-medium text-2xl md:text-3xl text-gray-800">
              20+
            </h2>
            <p className="text-xs md:text-sm text-gray-500">
              Years Experience
            </p>
          </div>

          <div className="text-center">
            <h2 className="font-medium text-2xl md:text-3xl text-gray-800">
              12k+
            </h2>
            <p className="text-xs md:text-sm text-gray-500">
              Projects Completed
            </p>
          </div>

          <div className="text-center">
            <h2 className="font-medium text-2xl md:text-3xl text-gray-800">
              5k+
            </h2>
            <p className="text-xs md:text-sm text-gray-500">
              Happy Customers
            </p>
          </div>

          <div className="text-center">
            <h2 className="font-medium text-2xl md:text-3xl text-gray-800">
              5+
            </h2>
            <p className="text-xs md:text-sm text-gray-500">Countries</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
