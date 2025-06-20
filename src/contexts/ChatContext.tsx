import { createContext, useContext, useState, ReactNode } from 'react';

interface ChatMessage {
  id: string;
  sender: 'mc' | 'user';
  message: string;
  timestamp: Date;
}

interface ChatContextType {
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  addMCMessage: (message: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    sender: "mc",
    message: "Welcome! I'm your AI-powered Music Concierge. How can I help you grow your music career today?",
    timestamp: new Date(),
  }
];

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  const addMessage = (messageData: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      timestamp: new Date(),
      ...messageData,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addMCMessage = (message: string) => {
    addMessage({ sender: 'mc', message });
  };

  return (
    <ChatContext.Provider value={{ messages, addMessage, addMCMessage }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
} 