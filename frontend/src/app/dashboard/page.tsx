"use client";

import { GooeySearchBar } from "@/components/ui/animated-search-bar";
import { VoiceInput } from "@/components/voice-input";
import { useState, useEffect, useRef } from "react";
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
  MessageSquare,
  Wand2,
  X,
  ChevronLeft,
  Globe,
  FileAudio,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SettingsPanel } from "@/components/settings-panel";

// Typing effect component for chatbot-like display
function TypingText({
  text,
  speed = 30,
  onComplete
}: {
  text: string;
  speed?: number;
  onComplete?: () => void;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (currentIndex === text.length && onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
  }, [text]);

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 mt-1">
          <MessageSquare className="h-4 w-4 text-brand" />
        </div>
        <div className="flex-1">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm leading-relaxed">
              {displayedText}
              {currentIndex < text.length && (
                <span className="animate-pulse">|</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Difficulty level type
type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// Summary content for different difficulty levels
const getSummaryContent = (level: DifficultyLevel): string => {
  const summaries = {
    beginner: `## Machine Learning Basics

**What is Machine Learning?**
Machine learning is like teaching a computer to learn from examples, just like how you learn to recognize cats by seeing many pictures of cats.

**Key Concepts:**
- **Supervised Learning**: Learning with a teacher (we give examples with correct answers)
- **Linear Regression**: Drawing a straight line through data points
- **Decision Trees**: Making decisions like a flowchart
- **Neural Networks**: Connecting many simple parts to solve complex problems

**Why It Matters:**
These tools help computers make predictions and decisions automatically, making our lives easier!`,

    intermediate: `## Machine Learning Fundamentals

**Supervised Learning Algorithms**
Supervised learning uses labeled training data to build predictive models:

- **Linear Regression**: Fits a linear relationship between input features and continuous target variables using least squares optimization
- **Decision Trees**: Non-parametric method that splits data recursively based on feature values to minimize impurity
- **Neural Networks**: Multi-layer perceptrons with backpropagation for complex non-linear pattern recognition

**Model Evaluation & Optimization**
- Cross-validation for robust performance estimation
- Feature engineering and selection techniques
- Hyperparameter tuning for optimal model configuration`,

    advanced: `## Advanced Machine Learning Theory

**Supervised Learning Algorithm Analysis**

**Linear Regression (Ordinary Least Squares)**
- Objective: Minimize sum of squared residuals: Σ(y_i - ŷ_i)²
- Assumptions: Linearity, independence, homoscedasticity, normality
- Regularization: Ridge (L2) and Lasso (L1) penalties for overfitting prevention

**Decision Trees & Ensemble Methods**
- Information gain/Gini impurity for optimal splits
- Bagging (Random Forest) vs Boosting (XGBoost) approaches
- Bias-variance tradeoff in ensemble learning

**Neural Network Architecture**
- Backpropagation: Chain rule application for gradient computation
- Activation functions: ReLU, Sigmoid, Tanh properties and derivatives
- Optimization: SGD variants (Adam, RMSprop) with learning rate scheduling`
  };

  return summaries[level];
};

export default function Dashboard() {
  // State management
  const [typingComplete, setTypingComplete] = useState(false);
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>('intermediate');
  const [isTranslated, setIsTranslated] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('Spanish');
  const [transcribedText, setTranscribedText] = useState<string>("");
  const [isUploaded, setIsUploaded] = useState<boolean>(false);
  const [uploadedName, setUploadedName] = useState<string>("");
  const [uploadedDuration, setUploadedDuration] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Text content
  const originalText = "Welcome to today's lecture on machine learning fundamentals. We'll be covering supervised learning algorithms, including linear regression, decision trees, and neural networks. These concepts form the foundation of modern artificial intelligence and are essential for understanding how machines can learn from data to make predictions and classifications.";

  const translatedTexts = {
    Spanish: "Bienvenidos a la conferencia de hoy sobre fundamentos de aprendizaje automático. Cubriremos algoritmos de aprendizaje supervisado, incluyendo regresión lineal, árboles de decisión y redes neuronales. Estos conceptos forman la base de la inteligencia artificial moderna y son esenciales para entender cómo las máquinas pueden aprender de los datos para hacer predicciones y clasificaciones.",
    French: "Bienvenue à la conférence d'aujourd'hui sur les fondamentaux de l'apprentissage automatique. Nous couvrirons les algorithmes d'apprentissage supervisé, y compris la régression linéaire, les arbres de décision et les réseaux de neurones. Ces concepts forment la base de l'intelligence artificielle moderne et sont essentiels pour comprendre comment les machines peuvent apprendre à partir de données pour faire des prédictions et des classifications.",
    German: "Willkommen zur heutigen Vorlesung über die Grundlagen des maschinellen Lernens. Wir werden überwachte Lernalgorithmen behandeln, einschließlich linearer Regression, Entscheidungsbäumen und neuronalen Netzwerken. Diese Konzepte bilden die Grundlage der modernen künstlichen Intelligenz und sind wesentlich, um zu verstehen, wie Maschinen aus Daten lernen können, um Vorhersagen und Klassifikationen zu treffen.",
    Hindi: "मशीन लर्निंग के मूल सिद्धांतों पर आज के व्याख्यान में आपका स्वागत है। हम सुपरवाइज्ड लर्निंग एल्गोरिदम को कवर करेंगे, जिसमें लीनियर रिग्रेशन, डिसीजन ट्रीज़ और न्यूरल नेटवर्क शामिल हैं। ये अवधारणाएं आधुनिक कृत्रिम बुद्धिमत्ता की नींव बनती हैं और यह समझने के लिए आवश्यक हैं कि मशीनें कैसे डेटा से सीखकर भविष्यवाणियां और वर्गीकरण कर सकती हैं।"
  };

  const availableLanguages = ['Spanish', 'French', 'German', 'Hindi'];

  // Initialize transcribed text with default content
  useEffect(() => {
    if (!transcribedText) {
      setTranscribedText(originalText);
    }
  }, [transcribedText]);

  // Handle audio file upload to backend for transcription
  const handleAudioUpload = async (file: File) => {
    try {
      // Compute duration client-side using Web Audio API
      const arrayBuffer = await file.arrayBuffer();
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
      const durationSec = Math.round(audioBuffer.duration);
      const mins = Math.floor(durationSec / 60);
      const secs = String(durationSec % 60).padStart(2, '0');
      const durationLabel = `${mins}:${secs}`;

      const placeholder = `Uploaded: "${file.name}" (~${durationLabel}).\n\nTranscription is not available without a server. This is a placeholder preview.`;

      setIsUploaded(true);
      setIsTranslated(false);
      setTypingComplete(false);
      setTranscribedText(placeholder);
      setUploadedName(file.name);
      setUploadedDuration(durationLabel);
    } catch (e) {
      console.error(e);
      setIsUploaded(true);
      setIsTranslated(false);
      setTypingComplete(false);
      setTranscribedText(`Uploaded: "${file.name}". Transcription unavailable offline.`);
      setUploadedName(file.name);
      setUploadedDuration("");
    }
  };

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
    <div className="relative flex min-h-screen">
      {/* Main Content */}
      <div className={`flex-1 space-y-8 pt-8 pb-28 transition-all duration-300 ${showSummaryPanel ? 'pr-96' : ''}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-blue-600">Lingo Lift</h1>
        <p className="text-lg text-muted-foreground">
          Transform your study materials into your preferred language
        </p>
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
          <div className="mt-4">
            <Dialog>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                      <Button
                        variant="glow"
                        size="sm"
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl"
                      >
                        <FileAudio className="h-4 w-4" />
                        Upload audio
                      </Button>
                    </DialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select MP3/WAV/M4A from your device</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload audio</DialogTitle>
                  <DialogDescription>Client-side only. MP3/WAV/M4A supported.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div
                    className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent/30 dark:hover:bg-accent/20 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <FileAudio className="h-6 w-6 text-brand" />
                      <p className="text-sm">Drag and drop audio here, or</p>
                      <Button size="sm">Choose file</Button>
                      <p className="text-xs text-muted-foreground">MP3, WAV, or M4A</p>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAudioUpload(file);
                    }}
                    className="hidden"
                  />
                  {uploadedName && (
                    <div className="text-sm text-muted-foreground">
                      Selected: <span className="text-foreground font-medium">{uploadedName}</span>
                      {uploadedDuration ? ` • ${uploadedDuration}` : ''}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Transcribed Audio Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-brand" />
                Transcribed Audio
              </CardTitle>
              <CardDescription>
                Your audio has been transcribed and is ready for review
              </CardDescription>
            </div>
            {/* Translate Button */}
            <div className="flex items-center gap-2">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="text-sm border rounded px-2 py-1 bg-background"
                disabled={isUploaded}
              >
                {availableLanguages.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTranslated(!isTranslated)}
                className="flex items-center gap-2"
                disabled={isUploaded}
              >
                <Globe className="h-4 w-4" />
                {isTranslated ? 'Original' : 'Translate'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TypingText
            text={isTranslated ? translatedTexts[selectedLanguage as keyof typeof translatedTexts] : transcribedText}
            speed={25}
            onComplete={() => setTypingComplete(true)}
          />

          {/* AI Summary Button - appears after typing is complete */}
          {typingComplete && (
            <div className="mt-4 flex justify-center">
              <Button
                onClick={() => setShowSummaryPanel(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Generate AI Summary
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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



      {/* Quick Actions (open dialogs) */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3 items-stretch">
          {/* Upload Document Dialog */}
          <Dialog>
            <Card className="hover:shadow-lg dark:hover:shadow-lg hover:bg-accent/50 dark:hover:bg-accent/50 transition-shadow cursor-pointer h-full flex flex-col">
              <CardHeader>
                <FileText className={`h-8 w-8 text-blue-500 mb-2`} />
                <CardTitle className="text-base">Upload Document</CardTitle>
                <CardDescription>Upload PDFs, notes, or images</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <DialogTrigger asChild>
                  <Button className="w-full">Get Started</Button>
                </DialogTrigger>
              </CardContent>
            </Card>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload document</DialogTitle>
                <DialogDescription>Client-side only. Choose a file to preview.</DialogDescription>
              </DialogHeader>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <p className="text-sm mb-2">Drag and drop here, or</p>
                <Button size="sm">Choose file</Button>
                <p className="text-xs text-muted-foreground mt-2">PDF, images supported (placeholder)</p>
              </div>
            </DialogContent>
          </Dialog>

          {/* View Documents Dialog (Recent Documents moved here) */}
          <Dialog>
            <Card className="hover:shadow-lg dark:hover:shadow-lg hover:bg-accent/50 dark:hover:bg-accent/50 transition-shadow cursor-pointer h-full flex flex-col">
              <CardHeader>
                <BookOpen className={`h-8 w-8 text-purple-500 mb-2`} />
                <CardTitle className="text-base">View Documents</CardTitle>
                <CardDescription>Access your AI summaries</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <DialogTrigger asChild>
                  <Button className="w-full">Open</Button>
                </DialogTrigger>
              </CardContent>
            </Card>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Recent Documents</DialogTitle>
                <DialogDescription>Your latest items</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
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
                      <Button variant="ghost" size="sm">View</Button>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Settings Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Card className="hover:shadow-lg dark:hover:shadow-lg hover:bg-accent/50 dark:hover:bg-accent/50 transition-shadow cursor-pointer h-full flex flex-col">
                <CardHeader>
                  <Settings className={`h-8 w-8 text-green-500 mb-2`} />
                  <CardTitle className="text-base">Settings</CardTitle>
                  <CardDescription>Language preferences & account</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <Button className="w-full" type="button">Open</Button>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
                <DialogDescription>Configure your preferences</DialogDescription>
              </DialogHeader>
              <SettingsPanel />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Recent Documents moved to dialog under "View Documents" */}
      </div>

      {/* AI Summary Panel */}
      {showSummaryPanel && (
        <div className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-lg z-50 flex flex-col">
          {/* Panel Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Brain className="h-5 w-5 text-brand" />
                  AI Summary
                </h2>
                <p className="text-sm text-muted-foreground">Generated notes for your lecture</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSummaryPanel(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Difficulty Toggle */}
          <div className="p-4 border-b">
            <label className="text-sm font-medium mb-3 block">Summary Level</label>
            <div className="flex rounded-lg bg-muted p-1">
              {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficultyLevel(level)}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                    difficultyLevel === level
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                {getSummaryContent(difficultyLevel)}
              </pre>
            </div>
          </div>

          {/* Panel Footer */}
          <div className="p-4 border-t">
            <Button className="w-full" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Save Summary
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

