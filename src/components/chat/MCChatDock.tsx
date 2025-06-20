import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { ChatMessage } from "@/types";
import { mockArtistProfile } from "@/lib/mockData";
import { useAIChat } from "@/hooks/useAIChat";
import useArtistStore from "@/stores/useArtistStore";

interface MCChatDockProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MCChatDock({ isOpen, onClose }: MCChatDockProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  const { sendMessage } = useAIChat();
  const { selectedArtist, artistStats } = useArtistStore();

  // Initialize with a welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: "welcome",
        sender: "mc",
        message: "Hi! I'm your Music Concierge. I'm here to help you grow your music career. Ask me anything about marketing, touring, social media strategy, or the music industry!",
        timestamp: new Date(),
      }]);
    }
  }, []);

  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Improved scroll behavior - only scroll for new messages
  useEffect(() => {
    // Only scroll if there are multiple messages and we're not at the initial state
    if (messages.length > 1 && isOpen) {
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Delay scroll slightly to prevent jarring movement
      scrollTimeoutRef.current = setTimeout(() => {
        // Only scroll the chat container, not the whole page
        const chatContainer = messagesEndRef.current?.parentElement?.parentElement;
        if (chatContainer) {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 100);
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages.length, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!message.trim() || isThinking) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      message: message.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    const currentMessage = message.trim();
    setMessage("");
    setIsThinking(true);

    try {
      // Send to AI service with context
      const aiResponse = await sendMessage(currentMessage, {
        conversationHistory: messages,
        context: {
          artistName: selectedArtist?.name,
          artistStats: artistStats,
        },
      });

      if (aiResponse) {
        const mcResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "mc",
          message: aiResponse,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, mcResponse]);
      }
    } catch (error: any) {
      console.error('AI Chat Error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "mc",
        message: error.message || "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    onClose();
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  return (
    <div
      className={`fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-2xl z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      role="dialog"
      aria-labelledby="chat-title"
      aria-modal="true"
    >
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle id="chat-title" className="text-lg font-semibold">MC Assistant</CardTitle>
          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="icon"
            onClick={handleClose}
            aria-label="Close chat"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">Your AI-powered music career assistant</p>
      </CardHeader>

      <CardContent className="flex flex-col h-full p-0">
        <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ height: "calc(100vh - 200px)" }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}
            >
              {msg.sender === 'mc' && (
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">MC</span>
                </div>
              )}

              <div className={`max-w-xs rounded-xl p-4 ${msg.sender === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground'
                }`}>
                <p className="text-sm whitespace-pre-line">{msg.message}</p>
              </div>

              {msg.sender === 'user' && (
                <img
                  src={mockArtistProfile.avatar}
                  alt="Your profile"
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
              )}
            </div>
          ))}

          {/* Thinking animation */}
          {isThinking && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">MC</span>
              </div>
              <div className="bg-muted text-foreground rounded-xl p-4 flex items-center space-x-2">
                <div className="flex space-x-1">
                  <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-6 border-t border-border">
          <div className="flex space-x-3">
            <Input
              type="text"
              placeholder="Ask me anything about your music career..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              disabled={isThinking}
            />
            <Button
              type="submit"
              disabled={!message.trim() || isThinking}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isThinking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </div>
  );
}
