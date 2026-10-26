"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { AutoFetchBar } from "@/components/admin/auto-fetch-bar";
import type { ProductDraft } from "@/lib/product-fetcher";

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    affiliate_link: "",
    image_url: "",
  });
  // A-to-Z fetched extras (saved alongside the product)
  const [extras, setExtras] = useState<{
    mrp: number | null;
    discount_percent: number | null;
    currency: string;
    brand: string;
    sku: string;
    source: string;
    rating: number | null;
    review_count: number | null;
    availability: string;
    images: string[];
    specs: { key: string; value: string }[];
    reviews: {
      author: string;
      rating: number | null;
      title: string;
      body: string;
      date: string | null;
    }[];
  }>({
    mrp: null,
    discount_percent: null,
    currency: "INR",
    brand: "",
    sku: "",
    source: "",
    rating: null,
    review_count: null,
    availability: "",
    images: [],
    specs: [],
    reviews: [],
  });
  const [values, setValues] = useState<string[]>([""]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    setAuthenticated(true);
    fetchCategories();
  }, [router]);

  const fetchCategories = async () => {
    try {
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (err) throw err;
      setCategories(data || []);
      if (data && data.length > 0) {
        setFormData((prev) => ({ ...prev, category: data[0].slug }));
      }
    } catch (err) {
      console.error("Failed to load categories", err);
      // Fallback or just show empty
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleValueChange = (index: number, value: string) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
  };

  const addValueField = () => {
    setValues([...values, ""]);
  };

  const removeValueField = (index: number) => {
    setValues(values.filter((_, i) => i !== index));
  };

  const handleAutoFilled = (draft: ProductDraft) => {
    setFormData((prev) => ({
      ...prev,
      // Only overwrite fields that were left empty — admin never loses typed data
      name: prev.name.trim() || draft.name || prev.name,
      description: prev.description.trim() || draft.description || prev.description,
      price:
        !prev.price || Number.isNaN(parseFloat(prev.price))
          ? draft.price != null
            ? String(draft.price)
            : prev.price
          : prev.price,
      image_url: prev.image_url.trim() || draft.image_url || prev.image_url,
      affiliate_link: prev.affiliate_link.trim() || draft.canonical_url || prev.affiliate_link,
    }));
    setExtras({
      mrp: draft.mrp ?? null,
      discount_percent: draft.discount_percent ?? null,
      currency: draft.currency || "INR",
      brand: draft.brand ?? "",
      sku: draft.sku ?? "",
      source: draft.source ?? "",
      rating: draft.rating ?? null,
      review_count: draft.review_count ?? null,
      availability: draft.availability ?? "",
      images: draft.images ?? [],
      specs: draft.specs ?? [],
      reviews: draft.reviews ?? [],
    });
    const features = draft.features.filter((f) => f.trim());
    if (features.length) {
      setValues(features.length ? features : [""]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      if (!formData.name.trim()) {
        throw new Error("Name is required");
      }
      const priceNumber = parseFloat(formData.price);
      if (Number.isNaN(priceNumber)) {
        throw new Error("Price must be a valid number");
      }
      let categoryValue = formData.category;
      if (!categoryValue) {
        if (categories.length > 0) {
          categoryValue = categories[0].slug;
        } else {
          categoryValue = "uncategorized";
        }
      }

      const baseSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      let slug = baseSlug || `product-${Date.now()}`;
      let suffix = 1;
      // Ensure unique slug
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { data: existing } = await supabase
          .from("products")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();
        if (!existing) break;
        slug = `${baseSlug}-${suffix++}`;
      }

      // Insert product (with all A-to-Z fetched extras)
      const { data: productData, error: productError } = await supabase
        .from("products")
        .insert([
          {
            name: formData.name,
            description: formData.description,
            price: priceNumber,
            category: categoryValue,
            affiliate_link: formData.affiliate_link,
            image_url: formData.image_url,
            slug: slug,
            mrp: extras.mrp,
            discount_percent: extras.discount_percent,
            currency: extras.currency,
            brand: extras.brand,
            sku: extras.sku,
            source: extras.source,
            rating: extras.rating,
            review_count: extras.review_count,
            availability: extras.availability,
            images: extras.images,
            specs: extras.specs,
            reviews: extras.reviews,
          },
        ])
        .select()
        .single();

      if (productError) throw productError;

      // Insert values
      const valuesToInsert = values
        .filter((v) => v.trim())
        .map((v) => ({
          product_id: productData.id,
          value_text: v,
        }));

      if (valuesToInsert.length > 0) {
        const { error: valuesError } = await supabase
          .from("product_values")
          .insert(valuesToInsert);
        if (valuesError) throw valuesError;
      }

      router.push("/admin/dashboard");
    } catch (err) {
      const message =
        (err as any)?.message ??
        (typeof err === "string" ? err : "Failed to create product");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-2">Add New Product</h1>
          <p className="text-muted-foreground mb-6 text-sm">
            Manually fill the form below, or paste a product link and let it
            auto-fill everything.
          </p>
          <div className="mb-8">
            <AutoFetchBar onFilled={handleAutoFilled} />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Product Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Enter product description"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Price *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      step="0.01"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {categories.length > 0 ? (
                        categories.map((cat) => (
                          <option key={cat.id} value={cat.slug}>
                            {cat.name}
                          </option>
                        ))
                      ) : (
                        <option value="">Loading categories...</option>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Product / Affiliate Link
                  </label>
                  <input
                    type="url"
                    name="affiliate_link"
                    value={formData.affiliate_link}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://www.amazon.in/dp/... | https://flipkart.com/... | https://myntra.com/..."
                  />
                </div>
              </div>
            </div>

            {/* Key Features/Values */}
            <div className="pt-8 border-t border-border">
              <h2 className="text-lg font-semibold mb-4">Key Features</h2>
              <div className="space-y-3 mb-4">
                {values.map((value, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleValueChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter a key feature"
                    />
                    {values.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeValueField(index)}
                        className="px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addValueField}
                className="text-primary hover:underline text-sm font-medium"
              >
                + Add Another Feature
              </button>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-8 border-t border-border">
              <Link href="/admin/dashboard">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Create Product
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
