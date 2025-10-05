"use client";

import { HeroSection } from "@/components/ui/hero-section";
import { Navbar } from "@/components/navbar";
import { FeaturesSectionWithHoverEffects } from "@/components/feature-section-with-hover-effects";
import { Testimonials } from "@/components/ui/testimonials";
import { BookOpen, Upload, Users, Star, ArrowRight, Globe, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/blur-fade";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="">
      <BlurFade className="" delay={0.1}>
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
          icon: <BookOpen className="h-5 w-5" />,
          variant: "glow"
        },
        {
          text: "Learn More",
          href: "#features",
          icon: <Upload className="h-4 w-4" />
        }
      ]}
      image={{
        light: "https://aqyvkqjkdpgzbrjniwxf.supabase.co/storage/v1/object/public/htv/light.png",
        dark: "https://aqyvkqjkdpgzbrjniwxf.supabase.co/storage/v1/object/public/htv/dark.png",
        alt: "Fiery lava erupting from a volcano at night"
      }}
      />
      </BlurFade>
      {/* Features Section */}
      <BlurFade className="" delay={0.2} inView={true}>
      <section id="features" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Zap className="w-4 h-4 mr-2" />
              Powerful Features
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform any educational content into your native language with our AI-powered platform
            </p>
          </div>
          
          <FeaturesSectionWithHoverEffects />
        </div>
      </section>
      </BlurFade>
      
      {/* Testimonials Section */}
      <BlurFade className="" delay={0.3} inView={true}>
        <section className="py-24 bg-muted/40">
          <div className="container mx-auto px-4">
            <Testimonials
              testimonials={[
                {
                  image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
                  name: "Sarah M.",
                  username: "Computer Science Student, Canada",
                  text: "Lingo Lift completely changed my university experience. I can now understand complex lectures and participate confidently in discussions.",
                  social: "https://twitter.com"
                },
                {
                  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
                  name: "Ahmed K.",
                  username: "Engineering Student, Germany",
                  text: "The AI summaries are incredible. I save hours every week and my grades have improved significantly since using Lingo Lift.",
                  social: "https://twitter.com"
                },
                {
                  image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
                  name: "Li Chen",
                  username: "Business Student, Australia",
                  text: "Finally, a tool that understands the struggles of international students. Lingo Lift is a game-changer for academic success.",
                  social: "https://twitter.com"
                },
                {
                  image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                  name: "Marco R.",
                  username: "Medicine Student, Italy",
                  text: "The real-time translation feature is a lifesaver during lectures. I can focus on learning instead of struggling with language barriers.",
                  social: "https://twitter.com"
                },
                {
                  image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
                  name: "Priya S.",
                  username: "Data Science Student, India",
                  text: "Lingo Lift's voice translation helped me understand my professor's accent perfectly. My confidence in class has skyrocketed!",
                  social: "https://twitter.com"
                },
                {
                  image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
                  name: "James L.",
                  username: "MBA Student, UK",
                  text: "The multi-format support is amazing. I can upload PDFs, audio files, and documents - everything gets translated perfectly.",
                  social: "https://twitter.com"
                }
              ]}
              title="Loved by Students Worldwide"
              description="See how Lingo Lift is transforming the educational experience for international students"
              maxDisplayed={3}
            />
          </div>
        </section>
      </BlurFade>
      {/* CTA Section */}
      <BlurFade className="" delay={0.4} inView={true}>
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-12 text-center text-primary-foreground">
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Learning?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of international students who are already succeeding with Lingo Lift. Start your journey to academic excellence today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <a href="/dashboard" className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Start Learning Free
                </a>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                <a href="#features" className="flex items-center gap-2">
                  Learn More
                  <ArrowRight className="w-5 h-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
      </BlurFade>
      {/* Footer */}
      <footer className="bg-muted/60 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Lingo Lift</h3>
              <p className="text-muted-foreground mb-4">
                Breaking down language barriers in education for international students worldwide.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Discord</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Lingo Lift. All rights reserved.</p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
