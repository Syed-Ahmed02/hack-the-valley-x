"use client";

import { GooeySearchBar } from "@/components/ui/animated-search-bar";
import { VoiceInput } from "@/components/voice-input";
import { Conversation } from "@/components/ui/conversation";
import { EnglishTutor } from "@/components/ui/english-tutor";
import { VoiceAgent } from "@/components/ui/voice-agent";
import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
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
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  // Get authenticated user
  const { auth0User } = useUser();
  
  // State management
  const [typingComplete, setTypingComplete] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('Spanish');

  // Text content
  const originalText = "Welcome to today's lecture on machine learning fundamentals. We'll be covering supervised learning algorithms, including linear regression, decision trees, and neural networks. These concepts form the foundation of modern artificial intelligence and are essential for understanding how machines can learn from data to make predictions and classifications.";

  const translatedTexts = {
    Spanish: "Bienvenidos a la conferencia de hoy sobre fundamentos de aprendizaje automático. Cubriremos algoritmos de aprendizaje supervisado, incluyendo regresión lineal, árboles de decisión y redes neuronales. Estos conceptos forman la base de la inteligencia artificial moderna y son esenciales para entender cómo las máquinas pueden aprender de los datos para hacer predicciones y clasificaciones.",
    French: "Bienvenue à la conférence d'aujourd'hui sur les fondamentaux de l'apprentissage automatique. Nous couvrirons les algorithmes d'apprentissage supervisé, y compris la régression linéaire, les arbres de décision et les réseaux de neurones. Ces concepts forment la base de l'intelligence artificielle moderne et sont essentiels pour comprendre comment les machines peuvent apprendre à partir de données pour faire des prédictions et des classifications.",
    German: "Willkommen zur heutigen Vorlesung über die Grundlagen des maschinellen Lernens. Wir werden überwachte Lernalgorithmen behandeln, einschließlich linearer Regression, Entscheidungsbäumen und neuronalen Netzwerken. Diese Konzepte bilden die Grundlage der modernen künstlichen Intelligenz und sind wesentlich, um zu verstehen, wie Maschinen aus Daten lernen können, um Vorhersagen und Klassifikationen zu treffen.",
    Hindi: "मशीन लर्निंग के मूल सिद्धांतों पर आज के व्याख्यान में आपका स्वागत है। हम सुपरवाइज्ड लर्निंग एल्गोरिदम को कवर करेंगे, जिसमें लीनियर रिग्रेशन, डिसीजन ट्रीज़ और न्यूरल नेटवर्क शामिल हैं। ये अवधारणाएं आधुनिक कृत्रिम बुद्धिमत्ता की नींव बनती हैं और यह समझने के लिए आवश्यक हैं कि मशीनें कैसे डेटा से सीखकर भविष्यवाणियां और वर्गीकरण कर सकती हैं।"
  };

  const availableLanguages = ['Spanish', 'French', 'German', 'Hindi'];

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
    <div className="relative flex h-screen">
      {/* Main Content */}
      <div className="flex-1 space-y-8 py-8">
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
          <VoiceInput userId={auth0User?.sub} />
        </CardContent>
      </Card>

      {/* Text-to-Speech Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-brand" />
            Text-to-Speech Converter
          </CardTitle>
          <CardDescription>
            Convert any text to speech in multiple languages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Conversation />
        </CardContent>
      </Card>

      

      {/* Interactive Voice Agent Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-brand" />
            Interactive Voice Agent
          </CardTitle>
          <CardDescription>
            Have real-time voice conversations with an AI agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VoiceAgent />
        </CardContent>
      </Card>

    

      {/* Quick Actions */}
      
      </div>

    </div>
  );
}
