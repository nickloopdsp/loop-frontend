import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { X, Send } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { ChatMessage } from "@shared/schema";
import { mockArtistProfile } from "@/lib/mockData";

interface MCChatDockProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MCChatDock({ isOpen, onClose }: MCChatDockProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const { data: initialMessages } = useQuery({
    queryKey: ["/api/mock/chat-messages"],
  });

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      message: message.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage("");

    // Simulate MC response
    setTimeout(() => {
      const responses = [
        "That's a great question! Let me analyze your current data and provide some insights.",
        "Based on your recent activity, I'd recommend focusing on engagement with your top-performing content.",
        "I'll help you optimize your strategy. Here are some personalized suggestions for your music career.",
        "Great point! Your fan engagement metrics show promising trends in that area.",
      ];
      
      const mcResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "mc",
        message: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, mcResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
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
      className={`fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-2xl z-50 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
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
              
              <div className={`max-w-xs rounded-xl p-4 ${
                msg.sender === 'user' 
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
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-6 border-t border-border">
          <div className="flex space-x-3">
            <Input
              type="text"
              placeholder="Ask me anything about your music career..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </div>
  );
}
