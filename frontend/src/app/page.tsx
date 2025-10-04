"use client";

import { useState } from "react";

export default function Dashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const topicCards = [
    {
      title: "Recent Advances in Speech Recognition Technologies",
      description: "Explore cutting-edge developments in AI-powered speech recognition systems and their applications.",
      icon: "🎤"
    },
    {
      title: "Enhancing Articulation and Intonation in Speech",
      description: "Learn techniques to improve clarity, pronunciation, and vocal expression for better communication.",
      icon: "🗣️"
    },
    {
      title: "Exploring Speech Enhancement Tools and Techniques",
      description: "Discover advanced tools and methods for improving audio quality and speech intelligibility.",
      icon: "🔧"
    },
    {
      title: "Impact of Emotions and Intonation on Effective Communication",
      description: "Understand how emotional context and vocal patterns influence message delivery and reception.",
      icon: "💭"
    }
  ];

  const navigationItems = [
    { name: "Chats", icon: "💬", active: true },
    { name: "Reports", icon: "📊", active: false },
    { name: "Settings", icon: "⚙️", active: false },
    { name: "Support & Guide", icon: "❓", active: false },
    { name: "Logout", icon: "🚪", active: false }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-white/20 backdrop-blur-lg border-r border-white/30 p-6">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-gray-800">VoiceOver</h1>
          <p className="text-sm text-gray-600 mt-1">Voice Analysis Platform</p>
        </div>

        <nav className="space-y-2">
          {navigationItems.map((item, index) => (
            <button
              key={index}
              className={`sidebar-item w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                item.active
                  ? 'bg-white/40 text-gray-800 font-medium'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="font-heading text-3xl font-semibold text-gray-800">Dashboard</h2>
            <p className="text-gray-600 mt-1">Welcome back! Ready to analyze your voice?</p>
          </div>

          {/* Profile Section */}
          <div className="flex items-center gap-4 bg-white/40 backdrop-blur-lg rounded-2xl px-6 py-4 neumorphic">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">MJ</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">Mike Johnson</p>
              <p className="text-sm text-gray-600">2,450 credits available</p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <div
            className={`upload-area rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${
              dragActive ? 'scale-105' : ''
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="font-heading text-2xl font-semibold text-gray-800 mb-2">
              Upload your file
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your audio file here, or click to browse
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500 mb-4">
              <span className="bg-white/50 px-3 py-1 rounded-full">MP3</span>
              <span className="bg-white/50 px-3 py-1 rounded-full">WAV</span>
              <span className="bg-white/50 px-3 py-1 rounded-full">FLAC</span>
              <span className="bg-white/50 px-3 py-1 rounded-full">AAC</span>
              <span className="bg-white/50 px-3 py-1 rounded-full">OGG</span>
              <span className="bg-white/50 px-3 py-1 rounded-full">AIFF</span>
            </div>
            <p className="text-xs text-gray-500">Max file size: 1.5 GB</p>

            {selectedFile && (
              <div className="mt-4 p-4 bg-white/60 rounded-2xl">
                <p className="font-medium text-gray-800">Selected: {selectedFile.name}</p>
                <p className="text-sm text-gray-600">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            )}

            <input
              id="file-upload"
              type="file"
              accept=".mp3,.wav,.flac,.aac,.ogg,.aiff"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Topic Cards Grid */}
        <div className="mb-8">
          <h3 className="font-heading text-xl font-semibold text-gray-800 mb-6">Discussion Topics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topicCards.map((topic, index) => (
              <div
                key={index}
                className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 card-shadow hover:bg-white/80 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                    {topic.icon}
                  </div>
                  <div>
                    <h4 className="font-heading text-lg font-semibold text-gray-800 mb-2">
                      {topic.title}
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {topic.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white/40 backdrop-blur-lg rounded-2xl p-6 neumorphic">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter your query, e.g. for communication or chat search"
                className="w-full bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 text-lg"
              />
            </div>
            <button className="bg-gradient-to-r from-pink-400 to-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
