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

 <section className="flex flex-col items-center bg-background px-4 py-4">
        {/* Badge */}
        <div className="flex flex-wrap items-center justify-center gap-2 pl-2 pr-4 py-1.5 mt-30 rounded-full bg-secondary/50 border border-border">
          <div className="relative flex size-3.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping duration-300"></span>
            <span className="relative inline-flex size-2 rounded-full bg-green-600"></span>
          </div>
          <p className="text-sm text-muted-foreground">
            Trusted by 100+ smart shoppers worldwide
          </p>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-[66px]/19 text-center max-w-2xl mt-8 text-foreground bg-clip-text leading-tight font-medium">
          Discover products that truly deliver.
        </h1>

        {/* Sub text */}
        <p className="text-sm text-muted-foreground text-center max-w-[630px] mt-4">
          We curate top-rated, value-for-money products across categories to help you make confident buying decisions. From honest reviews to detailed comparisons, we simplify your shopping journey.
        </p>

        {/* Buttons with Next Link
        <div className="flex gap-3 mt-10">
          <Link
            href="/products"
            className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground text-xs md:text-sm px-6 py-3 rounded-lg transition cursor-pointer"
          >
            Explore Products
          </Link>
        </div> */}

        {/* Divider */}
        <div className="w-full max-w-[800px] h-[3px] mt-10 bg-linear-to-r from-background via-primary to-background"></div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-18 max-w-[930px] w-full">
          <div className="text-center">
            <h2 className="font-medium text-2xl md:text-3xl text-foreground">
              20+
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              Years of Experience in Product Research
            </p>
          </div>

          <div className="text-center">
            <h2 className="font-medium text-2xl md:text-3xl text-foreground">
              12k+
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              Products Reviewed & Compared
            </p>
          </div>

          <div className="text-center">
            <h2 className="font-medium text-2xl md:text-3xl text-foreground">
              5k+
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              Happy Readers Every Month
            </p>
          </div>

          <div className="text-center">
            <h2 className="font-medium text-2xl md:text-3xl text-foreground">
              5+
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">Countries Reached</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
