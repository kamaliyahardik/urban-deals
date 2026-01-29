"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, ExternalLink, ChevronLeft, Loader2 } from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  affiliate_link: string;
  image_url: string;
  category: string;
  created_at: string;
}

interface ProductValue {
  id: number;
  value_text: string;
}

interface Review {
  id: number;
  author: string;
  rating: number;
  review_text: string;
  created_at: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [values, setValues] = useState<ProductValue[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProductDetails() {
      try {
        const supabase = createClient();

        // Fetch product
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .single();

        if (productError) throw productError;
        setProduct(productData);

        // Fetch values
        const { data: valuesData, error: valuesError } = await supabase
          .from("product_values")
          .select("*")
          .eq("product_id", productId);

        if (valuesError) throw valuesError;
        setValues(valuesData || []);

        // Fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("reviews")
          .select("*")
          .eq("product_id", productId)
          .order("created_at", { ascending: false });

        if (reviewsError) throw reviewsError;
        setReviews(reviewsData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    fetchProductDetails();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Products
          </Link>
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-destructive">
            {error || "Product not found"}
          </div>
        </div>
      </div>
    );
  }

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Left: Image */}
          <div>
            {product.image_url && (
              <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden mb-4">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

            {/* Description */}
            <p className="text-lg text-muted-foreground mb-8">
              {product.description}
            </p>

            {/* Values/Features */}
            {values.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Key Features</h3>
                <ul className="space-y-3">
                  {values.map((value) => (
                    <li key={value.id} className="flex items-start gap-3">
                      <span className="text-primary mt-1">✓</span>
                      <span>{value.value_text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Category */}
            {product.category && (
              <div className="mb-8">
                <span className="inline-block px-4 py-2 bg-secondary text-secondary-foreground font-medium rounded-full">
                  {product.category}
                </span>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex gap-4">
              {product.affiliate_link && (
                <a
                  href={product.affiliate_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button size="lg" className="w-full gap-2">
                    Jaydeep ne Dukhane java nu che!
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
