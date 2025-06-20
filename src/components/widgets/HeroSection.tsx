import { Button } from "@/components/ui/button";
import { useState } from "react";

interface HeroSectionProps {
  onOpenChat: () => void;
}

export default function HeroSection({ onOpenChat }: HeroSectionProps) {
  const [userQuestion, setUserQuestion] = useState("");

  return (
    <div className="text-white w-full h-full flex flex-col">
      <h1 className="text-3xl font-bold text-white mb-4">
        Loop into the beat, Billie!
      </h1>
      <p className="text-green-400 text-sm mb-6">
        Your Music Concierge will plan the next steps for your growth.
      </p>
      
      <div className="space-y-4 w-full flex-1">
        {/* MC Question */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-black text-xs font-bold">MC</span>
          </div>
          <div className="glass-card rounded-lg p-3 max-w-md">
            <p className="text-white text-sm">
              Hey! Can you tell me the custom user's questions.
            </p>
          </div>
        </div>

        {/* User Question */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-black text-xs font-bold">MC</span>
          </div>
          <div className="glass-card rounded-lg p-3 max-w-md">
            <p className="text-white text-sm">
              Here you will see the answer of the MC chatbot and now the user can read 
              it and ask one more question without being redirected to the MC help 
              page. After second question and second answer move with proper button 
              message.
            </p>
          </div>
        </div>

        {/* User Response */}
        <div className="flex items-start gap-3 justify-end">
          <div className="glass-card rounded-lg p-3 max-w-md">
            <p className="text-white text-sm">
              Want some more info? Type here
            </p>
          </div>
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64"
              alt="User avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Chat Input */}
        <div className="flex items-center gap-2 mt-4">
          <input
            type="text"
            placeholder="Want some more info? Type here"
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            className="glass-input flex-1 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400"
          />
          <Button 
            className="glass-button-primary px-4 py-2 rounded-lg"
            onClick={onOpenChat}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
} 