import { useState, useCallback } from 'react';
import { Upload, FileText, Sparkles, TrendingUp, Target, Users, Calendar } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';

interface AnalysisResult {
  overallScore: number;
  categories: {
    targeting: number;
    timing: number;
    budget: number;
    creativity: number;
    reach: number;
  };
  strengths: string[];
  improvements: string[];
}

export default function StrategyReviewWidget() {
  const { addMCMessage } = useChat();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Mock analysis function - in real app, this would call an AI API
  const analyzeDocument = async (file: File) => {
    setIsAnalyzing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock analysis result
    const mockResult: AnalysisResult = {
      overallScore: 82,
      categories: {
        targeting: 88,
        timing: 75,
        budget: 85,
        creativity: 90,
        reach: 72
      },
      strengths: [
        "Strong creative concept with viral potential",
        "Well-defined target audience demographics",
        "Budget allocation aligns with campaign goals",
        "Multi-platform approach maximizes reach"
      ],
      improvements: [
        "Consider extending campaign duration for better momentum",
        "Include more micro-influencer partnerships",
        "Add A/B testing for creative variations",
        "Strengthen call-to-action messaging"
      ]
    };
    
    setAnalysisResult(mockResult);
    setIsAnalyzing(false);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'application/pdf' || 
                       droppedFile.type === 'application/msword' || 
                       droppedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                       droppedFile.type === 'text/plain')) {
      setFile(droppedFile);
      analyzeDocument(droppedFile);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      analyzeDocument(selectedFile);
    }
  }, []);

  const handleLearnMore = () => {
    if (!analysisResult) return;
    
    const message = `📊 Strategy Review Analysis for "${file?.name}"\n\n` +
      `Overall Score: ${analysisResult.overallScore}/100\n\n` +
      `Category Breakdown:\n` +
      `• Audience Targeting: ${analysisResult.categories.targeting}/100\n` +
      `• Campaign Timing: ${analysisResult.categories.timing}/100\n` +
      `• Budget Efficiency: ${analysisResult.categories.budget}/100\n` +
      `• Creative Impact: ${analysisResult.categories.creativity}/100\n` +
      `• Potential Reach: ${analysisResult.categories.reach}/100\n\n` +
      `💪 Strengths:\n${analysisResult.strengths.map(s => `• ${s}`).join('\n')}\n\n` +
      `🎯 Areas for Improvement:\n${analysisResult.improvements.map(i => `• ${i}`).join('\n')}\n\n` +
      `Would you like me to provide specific recommendations for any of these areas?`;
    
    addMCMessage(message);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="text-foreground w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Strategy Review</h3>
      </div>

      {!file ? (
        /* Upload Area */
        <div className="flex-1 flex items-center justify-center">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full h-full min-h-[200px] border-2 border-dashed rounded-lg transition-all duration-200 flex flex-col items-center justify-center p-6 ${
              isDragging 
                ? 'border-[#03FF96] bg-[#03FF96]/10' 
                : 'border-gray-600 hover:border-gray-500 bg-gray-800/30'
            }`}
          >
            <Upload className={`w-12 h-12 mb-4 ${isDragging ? 'text-[#03FF96]' : 'text-gray-400'}`} />
            <p className="text-muted-foreground text-center mb-2">
              Drag and drop your campaign strategy document here
            </p>
            <p className="text-muted-foreground/70 text-sm text-center mb-4">
              Supports PDF, DOC, DOCX, TXT
            </p>
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
              />
              <span className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors">
                Browse Files
              </span>
            </label>
          </div>
        </div>
      ) : isAnalyzing ? (
        /* Analyzing State */
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-24 h-24 mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-[#03FF96] to-[#03FF96]/50 rounded-full animate-spin" />
            <div className="absolute inset-2 bg-gray-900 rounded-full flex items-center justify-center">
              <FileText className="w-10 h-10 text-[#03FF96]" />
            </div>
          </div>
          <p className="text-muted-foreground mb-2">Analyzing your strategy document...</p>
          <p className="text-muted-foreground/70 text-sm">{file.name}</p>
        </div>
      ) : analysisResult ? (
        /* Results Display */
        <div className="flex-1 flex flex-col">
          {/* Overall Score */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-gray-700"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - analysisResult.overallScore / 100)}`}
                  className={getScoreColor(analysisResult.overallScore)}
                  style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-bold ${getScoreColor(analysisResult.overallScore)}`}>
                  {analysisResult.overallScore}
                </span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm mb-1">Campaign Strategy Score</p>
            <p className="text-muted-foreground/70 text-xs">{file.name}</p>
          </div>

          {/* Category Scores */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-muted-foreground">Targeting</span>
              </div>
              <span className={`text-sm font-medium ${getScoreColor(analysisResult.categories.targeting)}`}>
                {analysisResult.categories.targeting}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-muted-foreground">Timing</span>
              </div>
              <span className={`text-sm font-medium ${getScoreColor(analysisResult.categories.timing)}`}>
                {analysisResult.categories.timing}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-muted-foreground">Budget</span>
              </div>
              <span className={`text-sm font-medium ${getScoreColor(analysisResult.categories.budget)}`}>
                {analysisResult.categories.budget}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-muted-foreground">Creativity</span>
              </div>
              <span className={`text-sm font-medium ${getScoreColor(analysisResult.categories.creativity)}`}>
                {analysisResult.categories.creativity}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-muted-foreground">Reach</span>
              </div>
              <span className={`text-sm font-medium ${getScoreColor(analysisResult.categories.reach)}`}>
                {analysisResult.categories.reach}%
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto space-y-2">
            <button
              onClick={handleLearnMore}
              className="w-full bg-gray-800/50 hover:bg-gray-700/50 text-white py-2 px-4 rounded-lg border border-gray-600/50 flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-[0_0_20px_rgba(3,255,150,0.4)] hover:border-[#03FF96]/50"
            >
              <Sparkles className="w-4 h-4" />
              Learn More
            </button>
            <button
              onClick={() => {
                setFile(null);
                setAnalysisResult(null);
              }}
              className="w-full bg-gray-800/30 hover:bg-gray-700/30 text-gray-400 py-2 px-4 rounded-lg border border-gray-700/50 text-sm transition-colors"
            >
              Upload New Document
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
} 