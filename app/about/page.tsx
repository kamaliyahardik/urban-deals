'use client'

import React from "react"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle2, Award, Users, Lightbulb } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8">
          <span>←</span> Back to Home
        </Link>

        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold mb-6">About AffiliatePro</h1>
          <p className="text-xl text-muted-foreground text-balance">
            Your trusted destination for premium Amazon affiliate products, expert reviews, and quality recommendations.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16 pb-16 border-b border-border">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <div className="space-y-4 text-lg text-muted-foreground">
            <p>
              At AffiliatePro, we believe that finding the right product shouldn't be overwhelming. Our mission is to
              curate and present the best Amazon products, carefully vetted and reviewed to help you make informed
              decisions.
            </p>
            <p>
              We combine expert knowledge with real user feedback to ensure every product recommendation meets our
              standards of quality, value, and reliability.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16 pb-16 border-b border-border">
          <h2 className="text-3xl font-bold mb-8">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <ValueCard
              icon={<CheckCircle2 className="w-6 h-6" />}
              title="Authenticity"
              description="We provide honest reviews and genuine recommendations backed by real research and user feedback."
            />
            <ValueCard
              icon={<Award className="w-6 h-6" />}
              title="Quality"
              description="Every product we feature meets strict quality standards and offers genuine value to our users."
            />
            <ValueCard
              icon={<Users className="w-6 h-6" />}
              title="Community"
              description="We build a community of trust where users can share experiences and help each other make better choices."
            />
            <ValueCard
              icon={<Lightbulb className="w-6 h-6" />}
              title="Innovation"
              description="We constantly evolve our platform to provide better tools and insights for product discovery."
            />
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16 pb-16 border-b border-border">
          <h2 className="text-3xl font-bold mb-8">Why Trust Us</h2>
          <div className="space-y-4 text-lg text-muted-foreground">
            <p>✓ <span className="font-medium text-foreground">Expert Curation</span> - Our team carefully selects each product</p>
            <p>✓ <span className="font-medium text-foreground">Real Reviews</span> - Authentic feedback from verified users</p>
            <p>✓ <span className="font-medium text-foreground">Updated Information</span> - Real-time pricing and availability</p>
            <p>✓ <span className="font-medium text-foreground">Transparent Affiliate</span> - We clearly disclose our affiliate relationships</p>
            <p>✓ <span className="font-medium text-foreground">Customer Support</span> - Dedicated team ready to help 24/7</p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-primary/10 rounded-2xl p-12 border border-primary/20">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Product?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Browse our collection and discover products handpicked just for you.
          </p>
          <Link href="/products">
            <Button size="lg">
              Explore Products
            </Button>
          </Link>
        </section>
      </div>
    </div>
  )
}

function ValueCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="p-6">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </Card>
  )
}
