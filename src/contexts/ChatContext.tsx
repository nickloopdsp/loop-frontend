import { ChatStoreType, ChatMessage } from '@/stores/useChatStore';
import { createContext, useContext, useState, ReactNode } from 'react';


const ChatContext = createContext<ChatStoreType | undefined>(undefined);

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
