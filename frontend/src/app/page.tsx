"use client";

import { VoiceInput } from "@/components/voice-input";
import { GooeySearchBar } from "@/components/ui/animated-search-bar";
import {
  Mic,
  MessageCircle,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Brain,
  Volume2,
  Wrench,
  Heart
} from "lucide-react";

export default function Dashboard() {
  const topicCards = [
    {
      title: "Recent Advances in Speech Recognition Technologies",
      description: "Explore cutting-edge developments in AI-powered speech recognition systems and their applications.",
      icon: Brain,
      iconColor: "text-blue-500"
    },
    {
      title: "Enhancing Articulation and Intonation in Speech",
      description: "Learn techniques to improve clarity, pronunciation, and vocal expression for better communication.",
      icon: Volume2,
      iconColor: "text-green-500"
    },
    {
      title: "Exploring Speech Enhancement Tools and Techniques",
      description: "Discover advanced tools and methods for improving audio quality and speech intelligibility.",
      icon: Wrench,
      iconColor: "text-orange-500"
    },
    {
      title: "Impact of Emotions and Intonation on Effective Communication",
      description: "Understand how emotional context and vocal patterns influence message delivery and reception.",
      icon: Heart,
      iconColor: "text-pink-500"
    }
  ];

  const navigationItems = [
    { name: "Chats", icon: MessageCircle, active: true },
    { name: "Reports", icon: BarChart3, active: false },
    { name: "Settings", icon: Settings, active: false },
    { name: "Support & Guide", icon: HelpCircle, active: false },
    { name: "Logout", icon: LogOut, active: false }
  ];

  return (
    <div className="min-h-screen flex">
        {/* Sidebar */}
        <div className="w-64 theme-surface-secondary p-6 border-r border-opacity-30">
          <div className="mb-8">
            <h1 className="text-xl font-semibold theme-text-primary">VoiceOver</h1>
            <p className="text-xs theme-text-tertiary mt-1">Voice Analysis Platform</p>
          </div>

        <nav className="space-y-2">
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={index}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                  item.active
                    ? 'theme-surface-tertiary theme-text-primary font-medium'
                    : 'theme-text-secondary hover:theme-text-primary hover:theme-surface-tertiary'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span className="text-sm">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-2xl font-semibold theme-text-primary">Dashboard</h1>
            <p className="theme-text-secondary text-sm mt-1">Welcome back! Ready to analyze your voice?</p>
          </div>

          {/* Profile Section */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 theme-surface-secondary rounded-lg px-3 py-2 border border-opacity-20">
              <div className="w-8 h-8 theme-accent rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">MJ</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium theme-text-primary">Mike Johnson</span>
                <span className="text-xs theme-text-tertiary">2,450 credits</span>
              </div>
            </div>
          </div>
        </div>

        {/* Voice Input Section */}
        <div className="mb-8">
          <div className="theme-surface rounded-xl p-8 border border-opacity-20 shadow-sm">
            <h2 className="text-lg font-medium theme-text-primary mb-6 text-center">
              Start Voice Recording
            </h2>
            <VoiceInput />
          </div>
        </div>

        {/* Animated Search Bar */}
        <div className="mb-8">
          <div className="flex justify-center items-center p-4">
            <div className="w-full max-w-lg">
              <h2 className="text-lg font-medium theme-text-primary mb-4 text-center">
                Search Topics
              </h2>
              <div className="flex justify-center">
                <GooeySearchBar />
              </div>
            </div>
          </div>
        </div>

        {/* Topic Cards Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-medium theme-text-primary mb-6">Discussion Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topicCards.map((topic, index) => {
              const IconComponent = topic.icon;
              return (
                <div
                  key={index}
                  className="theme-surface-secondary rounded-lg p-5 hover:theme-surface transition-all duration-200 cursor-pointer group border border-opacity-20 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="group-hover:scale-105 transition-transform duration-200">
                      <IconComponent className={`w-6 h-6 ${topic.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="font-medium theme-text-primary mb-1 text-sm">
                        {topic.title}
                      </h3>
                      <p className="theme-text-secondary text-xs leading-relaxed">
                        {topic.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
