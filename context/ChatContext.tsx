/**
 * ChatContext
 *
 * Keeps in-memory conversations for the current session.
 * Persistent history is stored in Supabase via services/history.js.
 * Call saveToHistory() from your screen after a successful API call.
 */
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatContextType {
  conversations: any[];
  addConversation: (conversation: any) => void;
  clearConversations: () => void;
  activeMode: string;
  setActiveMode: (mode: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeMode, setActiveMode] = useState<string>('chat'); // chat | image | video | slides | audio

  const addConversation = (conversation: any) => {
    setConversations((prev) => [conversation, ...prev]);
  };

  const clearConversations = () => setConversations([]);

  return (
    <ChatContext.Provider
      value={{ conversations, addConversation, clearConversations, activeMode, setActiveMode }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
