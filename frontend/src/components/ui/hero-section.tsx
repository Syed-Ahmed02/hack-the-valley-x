"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon } from "lucide-react";
import { Mockup, MockupFrame } from "@/components/ui/mockup";
import { Glow } from "@/components/ui/glow";
import Image from "next/image";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface HeroAction {
  text: string;
  href: string;
  icon?: React.ReactNode;
  variant?: "default" | "glow";
}

interface HeroProps {
  badge?: {
    text: string;
    action: {
      text: string;
      href: string;
    };
  };
  title: string;
  description: string;
  actions: HeroAction[];
  image: {
    light: string;
    dark: string;
    alt: string;
  };
}

export function HeroSection({
  badge,
  title,
  description,
  actions,
  image,
}: HeroProps) {
  // Use the light image for now to avoid theme issues
  const imageSrc = image.light;

  return (
    <section
      className={cn(
        "bg-background text-foreground",
        "py-12 sm:py-24 md:py-32 px-4",
        "fade-bottom overflow-hidden pb-0"
      )}
    >
      <div className="mx-auto flex max-w-container flex-col gap-12 pt-16 sm:gap-24">
        <div className="flex flex-col items-center gap-6 text-center sm:gap-12">
          {/* Badge */}
          {badge && (
            <Badge variant="outline" className="animate-appear gap-2">
              <span className="text-muted-foreground">{badge.text}</span>
              <Button variant="ghost" size="sm" asChild className="h-auto p-1 text-xs group">
                <a href={badge.action.href} className="flex items-center gap-1">
                  {badge.action.text}
                  <ArrowRightIcon className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-1 group-hover:scale-110" />
                </a>
              </Button>
            </Badge>
          )}

          {/* Title */}
          <h1 className="relative z-10 inline-block animate-appear text-4xl font-bold leading-tight text-foreground drop-shadow-2xl sm:text-6xl sm:leading-tight md:text-8xl md:leading-tight">
            {title}
          </h1>

          {/* Description */}
          <p className="text-md relative z-10 max-w-[550px] animate-appear font-medium text-muted-foreground opacity-0 delay-100 sm:text-xl">
            {description}
          </p>

          {/* Actions */}
          <div className="relative z-10 flex animate-appear justify-center gap-4 opacity-0 delay-300">
            <div className="relative z-10 flex animate-appear justify-center gap-4 opacity-0 delay-300">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant}
                  size="lg"
                  asChild
                  className={action.variant === "glow" ? "relative overflow-hidden group" : ""}
                >
                  <a href={action.href} className="flex items-center gap-2 relative z-10 group">
                    {action.icon && (
                      <span className="transition-transform duration-200 group-hover:scale-110">
                        {action.icon}
                      </span>
                    )}
                    {action.text}
                    {action.variant === "glow" && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                        <div className="absolute -inset-1 bg-gradient-to-r from-brand via-brand-foreground to-brand rounded-lg blur opacity-30 group-hover:opacity-60 transition-opacity duration-200"></div>
                      </>
                    )}
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Image with Glow */}
          <div className="relative pt-12">
            <MockupFrame
              className="animate-appear opacity-0 delay-700"
              size="small"
            >
              <Mockup type="responsive">
                <Image
                  src={imageSrc}
                  alt={image.alt}
                  width={1248}
                  height={765}
                  priority
                />
              </Mockup>
            </MockupFrame>
            <Glow
              variant="top"
              className="animate-appear-zoom opacity-0 delay-1000"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
