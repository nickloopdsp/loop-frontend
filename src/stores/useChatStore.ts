import { create } from "zustand";

export interface ChatMessage {
    id: string;
    sender: 'mc' | 'user';
    message: string;
    timestamp: Date;
}

export interface ChatStoreType {
    messages: ChatMessage[];
    addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
    addMCMessage: (message: string) => void;
}

const useChatStore = create<ChatStoreType>((set) => ({
    messages: [],
    addMessage: (message) => set((state) => ({ messages: [...state.messages, { id: Date.now().toString(), sender: 'user', message, timestamp: new Date() } as unknown as ChatMessage] })),
    addMCMessage: (message) => set((state) => ({ messages: [...state.messages, { id: Date.now().toString(), sender: 'mc', message, timestamp: new Date() }] })),
}))

export default useChatStore;