"use client";

import React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "electronics",
    affiliate_link: "",
    image_url: "",
  });
  const [values, setValues] = useState<string[]>([""]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    setAuthenticated(true);
  }, [router]);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      // Insert product
      const { data: productData, error: productError } = await supabase
        .from("products")
        .insert([
          {
            name: formData.name,
            description: formData.description,
            category: formData.category,
            affiliate_link: formData.affiliate_link,
            image_url: formData.image_url,
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
      setError(err instanceof Error ? err.message : "Failed to create product");
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
          <h1 className="text-3xl font-bold mb-8">Add New Product</h1>

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
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="electronics">Electronics</option>
                      <option value="home">Home</option>
                      <option value="sports">Sports</option>
                      <option value="kitchen">Kitchen</option>
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
                    Amazon Affiliate Link
                  </label>
                  <input
                    type="url"
                    name="affiliate_link"
                    value={formData.affiliate_link}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://amazon.com/..."
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
