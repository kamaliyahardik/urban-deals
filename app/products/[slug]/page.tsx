"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExternalLink, ChevronLeft, Loader2 } from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  affiliate_link: string;
  image_url: string;
  category: string;
  created_at: string;
  slug: string;
}

interface ProductValue {
  id: number;
  value_text: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [values, setValues] = useState<ProductValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProductDetails() {
      try {
        const supabase = createClient();

        // Try fetch by slug first
        let { data: productData, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("slug", slug)
          .single();

        // If not found by slug, try by ID (if slug is numeric)
        if ((!productData || productError) && !isNaN(Number(slug))) {
           const { data: productById, error: idError } = await supabase
            .from("products")
            .select("*")
            .eq("id", slug)
            .single();
           
           if (productById) {
             productData = productById;
             productError = null;
           }
        }

        if (productError) throw productError;
        setProduct(productData);

        if (productData) {
            // Fetch values
            const { data: valuesData, error: valuesError } = await supabase
              .from("product_values")
              .select("*")
              .eq("product_id", productData.id);

            if (valuesError) throw valuesError;
            setValues(valuesData || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
        fetchProductDetails();
    }
  }, [slug]);

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
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
            <p className="text-muted-foreground">
              The product you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-lg">
            <img
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-contain p-8"
            />
          </div>

          {/* Details */}
          <div>
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {product.category}
                </span>
              </div>

              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              <p className="text-3xl font-bold text-primary mb-6">
                ${product.price}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {product.description}
              </p>

              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="flex-1 gap-2 text-lg h-14"
                  onClick={() => window.open(product.affiliate_link, "_blank")}
                >
                  Buy Now on Amazon <ExternalLink className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Key Features */}
            {values.length > 0 && (
              <Card className="p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4">Key Features</h3>
                <ul className="space-y-3">
                  {values.map((value) => (
                    <li key={value.id} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5" />
                      <span className="text-muted-foreground">
                        {value.value_text}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
