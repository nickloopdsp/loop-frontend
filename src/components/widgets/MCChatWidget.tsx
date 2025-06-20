import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useAIChat } from "@/hooks/useAIChat";
import useArtistStore from "@/stores/useArtistStore";
import useChatStore from "@/stores/useChatStore";

export default function MCChatWidget() {
  const { messages, addMessage } = useChatStore();
  const [userMessage, setUserMessage] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { sendMessage } = useAIChat();
  const { selectedArtist, artistStats } = useArtistStore();

  // Extract first name from artist name
  const getFirstName = (fullName: string | undefined) => {
    if (!fullName) return "there";
    const firstName = fullName.split(' ')[0];
    return firstName || "there";
  };

  const artistFirstName = getFirstName(selectedArtist?.name);

  useEffect(() => {
    // Only scroll within the chat container, not the whole page
    if (messagesEndRef.current && messages.length > 0) {
      const chatContainer = messagesEndRef.current.parentElement?.parentElement;
      if (chatContainer) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!userMessage.trim() || isThinking) return;

    addMessage({
      sender: "user",
      message: userMessage.trim(),
    });

    const currentMessage = userMessage.trim();
    setUserMessage("");
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
        addMessage({
          sender: "mc",
          message: aiResponse,
        });
      }
    } catch (error: any) {
      console.error('AI Chat Error:', error);
      // Show the actual error message
      addMessage({
        sender: "mc",
        message: error.message || "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
      });
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

  return (
    <div className="glass-widget text-foreground w-full h-full items-end">
      {/* Header - Compact */}
      <div className="w-full" style={{ alignSelf: 'flex-start' }}>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Welcome back, {artistFirstName}! 👋
        </h1>
        <p className="text-green-400 text-sm">
          Your AI Music Concierge is here to help you grow your career.
        </p>
      </div>

      {/* Chat Messages - Fixed Height with Scroll */}
      <div
        className="w-full overflow-y-auto flex-1"
        style={{ maxHeight: 'calc(100% - 180px)', overflowY: 'auto' }}
      >
        <div className="space-y-3 pr-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'mc' && (
                <div className="w-8 h-8 glass-item rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </div>
              )}

              <div
                className={`max-w-xs rounded-2xl px-4 py-3 glass-item text-foreground`}
              >
                <p className="text-sm leading-relaxed">{message.message}</p>
              </div>

              {message.sender === 'user' && (
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64"
                    alt="Your profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          ))}

          {/* Thinking animation */}
          {isThinking && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 glass-item rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="max-w-xs rounded-2xl px-4 py-3 glass-item text-foreground flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input - Fixed at Bottom */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-3 w-full">
        <input
          type="text"
          placeholder="Want some more info? Type here"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 rounded-2xl px-4 py-3 glass-input text-foreground text-sm placeholder-muted-foreground"
          disabled={isThinking}
        />
        <Button
          type="submit"
          disabled={!userMessage.trim() || isThinking}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isThinking ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Send'
          )}
        </Button>
      </form>
    </div>
  );
} 