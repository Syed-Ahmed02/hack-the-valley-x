"use client"

import { HeroSection } from "@/components/ui/hero-section"
import { Icons } from "@/components/ui/icons"

export function HeroSectionDemo() {
  return (
    <HeroSection
      badge={{
        text: "Introducing our new components",
        action: {
          text: "Learn more",
          href: "/docs",
        },
      }}
      title="Build faster with beautiful components"
      description="Premium UI components built with React and Tailwind CSS. Save time and ship your next project faster with our ready-to-use components."
      actions={[
        {
          text: "Get Started",
          href: "/docs/getting-started",
          variant: "default",
        },
        {
          text: "GitHub",
          href: "https://github.com/your-repo",
          variant: "glow",
          icon: <Icons.gitHub className="h-5 w-5" />,
        },
      ]}
      image={{
        light: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1248&h=765&fit=crop&crop=center",
        dark: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1248&h=765&fit=crop&crop=center",
        alt: "UI Components Preview",
      }}
    />
  )
}

export default HeroSectionDemo;
