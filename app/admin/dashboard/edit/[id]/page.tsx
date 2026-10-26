"use client";

import React from "react";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { AutoFetchBar } from "@/components/admin/auto-fetch-bar";
import type { ProductDraft } from "@/lib/product-fetcher";

interface ProductValue {
  id: number;
  value_text: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    affiliate_link: "",
    image_url: "",
  });
  const [values, setValues] = useState<ProductValue[]>([]);
  const [newValues, setNewValues] = useState<string[]>([""]);
  const [extras, setExtras] = useState<Record<string, unknown>>({});

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    setAuthenticated(true);
    fetchData();
  }, [productId, router]);

  const fetchData = async () => {
    try {
      const supabase = createClient();

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (categoriesError) console.error("Error fetching categories:", categoriesError);
      setCategories(categoriesData || []);

      // Fetch product
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (productError) throw productError;

      setFormData({
        name: productData.name,
        description: productData.description || "",
        category: productData.category || "",
        affiliate_link: productData.affiliate_link || "",
        image_url: productData.image_url || "",
      });
      setExtras({
        mrp: productData.mrp ?? null,
        discount_percent: productData.discount_percent ?? null,
        currency: productData.currency ?? "INR",
        brand: productData.brand ?? "",
        sku: productData.sku ?? "",
        source: productData.source ?? "",
        rating: productData.rating ?? null,
        review_count: productData.review_count ?? null,
        availability: productData.availability ?? "",
        images: Array.isArray(productData.images) ? productData.images : [],
        specs: Array.isArray(productData.specs) ? productData.specs : [],
        reviews: Array.isArray(productData.reviews) ? productData.reviews : [],
      });

      // Fetch values
      const { data: valuesData, error: valuesError } = await supabase
        .from("product_values")
        .select("*")
        .eq("product_id", productId);

      if (!valuesError && valuesData) {
        setValues(valuesData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product");
    } finally {
      setLoading(false);
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

  const handleNewValueChange = (index: number, value: string) => {
    const newVals = [...newValues];
    newVals[index] = value;
    setNewValues(newVals);
  };

  const handleAutoFilled = (draft: ProductDraft) => {
    setFormData((prev) => ({
      ...prev,
      name: draft.name || prev.name,
      description: draft.description || prev.description,
      image_url: draft.image_url || prev.image_url,
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
      setNewValues(features);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const supabase = createClient();

      // Update product (with all A-to-Z fetched extras)
      const { error: updateError } = await supabase
        .from("products")
        .update({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          affiliate_link: formData.affiliate_link,
          image_url: formData.image_url,
          ...extras,
          updated_at: new Date().toISOString(),
        })
        .eq("id", productId);

      if (updateError) throw updateError;

      // Add new values if any
      const valuesToInsert = newValues
        .filter((v) => v.trim())
        .map((v) => ({
          product_id: parseInt(productId),
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
      setError(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteValue = async (valueId: number) => {
    if (!confirm("Delete this feature?")) return;

    try {
      const supabase = createClient();
      const { error: err } = await supabase
        .from("product_values")
        .delete()
        .eq("id", valueId);

      if (err) throw err;
      setValues(values.filter((v) => v.id !== valueId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete feature");
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

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card className="p-8">
            <h1 className="text-3xl font-bold mb-2">Edit Product</h1>
            <p className="text-muted-foreground mb-6 text-sm">
              Need to refresh details? Paste the product link to auto-fill the
              fields below.
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
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
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
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Amazon Affiliate Link
                    </label>
                    <input
                      type="url"
                      name="affiliate_link"
                      value={formData.affiliate_link}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Existing Features */}
              {values.length > 0 && (
                <div className="pt-8 border-t border-border">
                  <h2 className="text-lg font-semibold mb-4">
                    Current Features
                  </h2>
                  <div className="space-y-2 mb-6">
                    {values.map((value) => (
                      <div
                        key={value.id}
                        className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                      >
                        <p>{value.value_text}</p>
                        <button
                          type="button"
                          onClick={() => deleteValue(value.id)}
                          className="text-destructive hover:text-destructive/80 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Features */}
              <div
                className={
                  values.length > 0 ? "" : "pt-8 border-t border-border"
                }
              >
                <h2 className="text-lg font-semibold mb-4">Add Features</h2>
                <div className="space-y-3 mb-4">
                  {newValues.map((value, index) => (
                    <input
                      key={index}
                      type="text"
                      value={value}
                      onChange={(e) =>
                        handleNewValueChange(index, e.target.value)
                      }
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter a key feature"
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setNewValues([...newValues, ""])}
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
                <Button type="submit" disabled={submitting}>
                  {submitting && (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
