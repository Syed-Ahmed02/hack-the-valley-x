import { cn } from "@/lib/utils";
import { Languages, Brain, FileText, Mic, Globe, Shield } from "lucide-react";

export function FeaturesSectionWithHoverEffects() {
  const features = [
    {
      title: "Real-time Translation",
      description:
        "Get instant translations of lectures, notes, and documents in 100+ languages",
      icon: <Languages className="w-6 h-6" />,
    },
    {
      title: "AI-Powered Summaries",
      description:
        "Intelligent summaries that capture key concepts and main ideas from any content",
      icon: <Brain className="w-6 h-6" />,
    },
    {
      title: "Multi-Format Support",
      description:
        "Upload PDFs, documents, audio files, and more - we handle it all",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: "Voice Translation",
      description: "Convert speech to text and translate in real-time during live lectures",
      icon: <Mic className="w-6 h-6" />,
    },
    {
      title: "Global Accessibility",
      description: "Designed specifically for international students worldwide",
      icon: <Globe className="w-6 h-6" />,
    },
    {
      title: "Secure & Private",
      description:
        "Your data is protected with enterprise-grade security and privacy",
      icon: <Shield className="w-6 h-6" />,
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature border-border",
        (index === 0 || index === 3) && "lg:border-l border-border",
        index < 3 && "lg:border-b border-border"
      )}
    >
      {index < 3 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-muted/50 to-transparent pointer-events-none" />
      )}
      {index >= 3 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-muted/50 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-primary">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-muted group-hover/feature:bg-primary transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-foreground">
          {title}
        </span>
      </div>
      <p className="text-sm text-muted-foreground max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
