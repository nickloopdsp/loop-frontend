import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X, Sparkles, Loader2, Send } from 'lucide-react';
import useModeStore from '@/stores/useModeStore';
import { useAIChat } from '@/hooks/useAIChat';
import useArtistStore from '@/stores/useArtistStore';

interface MCAssistTooltipProps {
  isVisible: boolean;
  onClose: () => void;
  onLayoutRecommendation: (layout: string) => void;
}

export default function MCAssistTooltip({
  isVisible,
  onClose,
  onLayoutRecommendation
}: MCAssistTooltipProps) {
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recommendation, setRecommendation] = useState('');
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const { setMode } = useModeStore();
  const { sendMessage } = useAIChat();
  const { selectedArtist } = useArtistStore();

  // Handle Escape key to close tooltip
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        console.log('Escape key pressed!', { hasUserInteracted, userInput: userInput.trim() }); // Debug log

        // If user hasn't interacted or typed anything, revert to standard mode
        if (!hasUserInteracted && userInput.trim().length === 0) {
          console.log('No user interaction detected, reverting to standard mode');
          setMode('standard');
        }

        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isVisible, onClose, hasUserInteracted, userInput, setMode]);

  // Reset state when tooltip becomes visible
  useEffect(() => {
    if (isVisible) {
      setUserInput('');
      setHasUserInteracted(false);
      setRecommendation('');
      setIsProcessing(false);
    }
  }, [isVisible]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isProcessing) return;

    setIsProcessing(true);

    try {
      const prompt = `As a music industry AI assistant, analyze the following artist needs and recommend the best dashboard layout mode:

Artist: ${selectedArtist?.name || 'Unknown Artist'}
Current Needs: "${userInput.trim()}"

Available modes:
- Standard: Complete overview with all widgets
- Recording: Focus on music creation (chords, stem separation, production tools)
- Touring: Concert logistics (events, map, fan locations, performance metrics)  
- Promotion: Social media focus (fans, followers, engagement, reach)
- Inspiration: Creative discovery (AI tools, trending music, creative planning)
- Strategy: Data analysis (metrics, growth analytics, strategic planning)

Respond with:
1. Recommended mode name
2. Brief explanation (1-2 sentences) of why this mode fits their needs
3. Key widgets they should focus on

Format: "Mode: [MODE_NAME] | Explanation: [EXPLANATION] | Focus: [KEY_WIDGETS]"`;

      const response = await sendMessage(prompt, {
        context: {
          artistName: selectedArtist?.name,
          userNeeds: userInput,
        }
      });

      if (response) {
        setRecommendation(response);

        // Extract mode from AI response
        const modeMatch = response.match(/Mode:\s*(\w+)/i);
        if (modeMatch) {
          const recommendedMode = modeMatch[1].toLowerCase();
          // Map AI response to actual mode IDs
          const modeMapping: Record<string, string> = {
            'standard': 'standard',
            'recording': 'recording',
            'touring': 'touring',
            'promotion': 'promotion',
            'inspiration': 'inspiration',
            'strategy': 'strategy'
          };

          const mappedMode = modeMapping[recommendedMode];
          if (mappedMode) {
            onLayoutRecommendation(mappedMode);
          }
        }
      }
    } catch (error) {
      console.error('Error getting AI recommendation:', error);
      setRecommendation('I apologize, but I\'m having trouble analyzing your needs right now. Please try again in a moment.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyRecommendation = () => {
    const modeMatch = recommendation.match(/Mode:\s*(\w+)/i);
    if (modeMatch) {
      const recommendedMode = modeMatch[1].toLowerCase();
      const modeMapping: Record<string, any> = {
        'standard': 'standard',
        'recording': 'recording',
        'touring': 'touring',
        'promotion': 'promotion',
        'inspiration': 'inspiration',
        'strategy': 'strategy'
      };

      const mappedMode = modeMapping[recommendedMode];
      if (mappedMode) {
        setMode(mappedMode);
        onClose();
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div className="absolute top-2 left-2 w-96 z-50">
      <div className="glass-item border border-white/20 rounded-2xl p-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-white">MC Layout Assistant</h3>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Close button clicked!', { hasUserInteracted, userInput: userInput.trim() }); // Debug log

              // If user hasn't interacted or typed anything, revert to standard mode
              if (!hasUserInteracted && userInput.trim().length === 0) {
                console.log('No user interaction detected, reverting to standard mode');
                setMode('standard');
              }

              onClose();
            }}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
            type="button"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <p className="text-xs text-gray-300">
            Tell me what you're focusing on right now, and I'll recommend the perfect dashboard layout for your needs.
          </p>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value);
                // Mark as interacted when user starts typing
                if (e.target.value.trim().length > 0 && !hasUserInteracted) {
                  setHasUserInteracted(true);
                }
              }}
              placeholder="e.g., I'm preparing for my upcoming tour and need to track ticket sales and plan logistics..."
              className="w-full h-20 px-3 py-2 rounded-xl glass-input text-white text-xs placeholder-gray-400 resize-none"
              disabled={isProcessing}
            />

            <Button
              type="submit"
              disabled={!userInput.trim() || isProcessing}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-2 rounded-xl font-medium disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="w-3 h-3 mr-2" />
                  Get Recommendation
                </>
              )}
            </Button>
          </form>

          {/* Recommendation Display */}
          {recommendation && (
            <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-start gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-white">
                  <div className="font-medium mb-1">My Recommendation:</div>
                  <div className="text-gray-300 leading-relaxed">{recommendation}</div>
                </div>
              </div>

              <Button
                onClick={handleApplyRecommendation}
                className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded-xl font-medium"
              >
                Apply This Layout
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Pointer Arrow */}
      <div className="absolute -bottom-2 left-8 w-4 h-4 bg-white/10 border-r border-b border-white/20 transform rotate-45 backdrop-blur-md"></div>
    </div>
  );
} 