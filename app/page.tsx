"use client";

import React from "react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import HeroSection from "@/components/HeroSection";
import { Star, Zap, Shield, Headphones } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header/Navigation
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            AffiliatePro
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/products" className="text-foreground hover:text-primary transition">
              Products
            </Link>
            <Link href="/about" className="text-foreground hover:text-primary transition">
              About
            </Link>
            <Link href="/contact" className="text-foreground hover:text-primary transition">
              Contact
            </Link>
          </div>
        </div>
      </nav> */}

      {/* Hero Section
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Discover Premium Amazon Products
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-balance max-w-2xl mx-auto">
            Handpicked, verified products with expert reviews. Find the best items for your needs backed by real user feedback.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="w-full sm:w-auto">
                Explore Products
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section> */}

      <HeroSection />
      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Why Choose AffiliatePro
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Star className="w-8 h-8" />}
              title="Expert Curated"
              description="Carefully selected products vetted for quality and value"
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Always Updated"
              description="Real-time pricing and availability information"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Trustworthy Reviews"
              description="Authentic user reviews and detailed specifications"
            />
            <FeatureCard
              icon={<Headphones className="w-8 h-8" />}
              title="24/7 Support"
              description="Dedicated support for all your questions"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center bg-primary/10 rounded-2xl p-12 border border-primary/20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Your Perfect Product?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Browse our collection of premium items and find exactly what you're
            looking for.
          </p>
          <Link href="/products">
            <Button size="lg" className="px-8">
              Start Shopping
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </Card>
  );
}
