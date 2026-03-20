/**
 * ChatContext
 *
 * Keeps in-memory conversations for the current session.
 * Persistent history is stored in Supabase via services/history.js.
 * Call saveToHistory() from your screen after a successful API call.
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { fetchHistory } from '@/services/history';

interface ChatContextType {
  conversations: any[];
  addConversation: (conversation: any) => void;
  clearConversations: () => void;
  activeMode: string;
  setActiveMode: (mode: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { userId } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeMode, setActiveMode] = useState<string>('chat'); // chat | image | video | slides | audio

  useEffect(() => {
    if (userId) {
      fetchHistory(userId).then(({ data }) => {
        if (data) {
          const formatted = data.map((item: any) => ({
            id: item.id,
            prompt: item.prompt,
            result: item.type === 'chat' || item.type === 'image' || item.type === 'audio' 
              ? item.result 
              : JSON.parse(item.result),
            type: item.type,
            timestamp: new Date(item.created_at),
          }));
          setConversations(formatted);
        }
      });
    } else {
      setConversations([]);
    }
  }, [userId]);

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
