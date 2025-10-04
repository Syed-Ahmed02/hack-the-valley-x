"use client";

import { HeroSection } from "@/components/ui/hero-section";
import { BookOpen, Upload } from "lucide-react";

export default function HomePage() {
  return (
    <HeroSection
      badge={{
        text: "AI-Powered Study Tool",
        action: {
          text: "Learn more",
          href: "#features"
        }
      }}
      title="Lingo Lift"
      description="Break down language barriers in education. Upload lecture notes, PDFs, or recorded lectures and get AI-powered summaries and translations in your preferred language—making learning accessible for international students everywhere."
      actions={[
        {
          text: "Start Learning",
          href: "/dashboard",
          icon: <BookOpen className="h-4 w-4" />,
          variant: "glow"
        },
        {
          text: "Upload Materials",
          href: "#upload",
          icon: <Upload className="h-4 w-4" />
        }
      ]}
      image={{
        light: "/landinpicture1.jpg",
        dark: "/landinpicture1.jpg",
        alt: "Fiery lava erupting from a volcano at night"
      }}
    />
  );
}
