"use client";

import { GooeySearchBar } from "@/components/ui/animated-search-bar";
import { VoiceInput } from "@/components/voice-input";
import {
  FileText,
  Languages,
  BookOpen,
  Sparkles,
  TrendingUp,
  Clock,
  Mic,
  Settings,
  Brain,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const recentDocuments = [
    {
      title: "Lecture Notes - Computer Science 101",
      description: "Last modified 2 hours ago",
      icon: FileText,
      language: "English → Bangla",
    },
    {
      title: "Biology Chapter 5 Summary",
      description: "Last modified yesterday",
      icon: FileText,
      language: "English → Hindi",
    },
    {
      title: "Mathematics Formulas",
      description: "Last modified 3 days ago",
      icon: FileText,
      language: "English → Urdu",
    },
  ];

  const quickActions = [
    {
      title: "Upload Document",
      description: "Upload PDFs, notes, or images",
      icon: FileText,
      color: "text-blue-500",
      href: "/upload",
    },
    {
      title: "View Documents",
      description: "Access your AI summaries",
      icon: BookOpen,
      color: "text-purple-500",
      href: "/documents",
    },
    {
      title: "Settings",
      description: "Language preferences & account",
      icon: Settings,
      color: "text-green-500",
      href: "/settings",
    },
  ];

  const stats = [
    {
      title: "Documents Processed",
      value: "24",
      icon: FileText,
      change: "+12%",
    },
    {
      title: "Languages Used",
      value: "5",
      icon: Languages,
      change: "+2",
    },
    {
      title: "Time Saved",
      value: "18h",
      icon: Clock,
      change: "+45%",
    },
  ];

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">UnderstandAI</h1>
        <p className="text-lg text-muted-foreground">
          Transform your study materials into your preferred language
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Voice Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-brand" />
            Record Audio Lecture
          </CardTitle>
          <CardDescription>
            Record or upload audio lectures to transcribe and translate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VoiceInput />
        </CardContent>
      </Card>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand" />
            Quick Search
          </CardTitle>
          <CardDescription>
            Search through your uploaded documents and summaries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GooeySearchBar />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <action.icon className={`h-8 w-8 ${action.color} mb-2`} />
                <CardTitle className="text-base">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <a href={action.href}>Get Started</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Documents */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Documents</h2>
        <div className="space-y-3">
          {recentDocuments.map((doc, index) => (
            <Card key={index} className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-4 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
                  <doc.icon className="h-5 w-5 text-brand" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-sm">{doc.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {doc.description} • {doc.language}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

