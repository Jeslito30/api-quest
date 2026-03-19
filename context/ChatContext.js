import React, { createContext, useContext, useState } from 'react';

const ChatContext = createContext({});

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [activeMode, setActiveMode] = useState('chat'); // chat | image | video | slides | audio

  const addConversation = (conversation) => {
    setConversations((prev) => [conversation, ...prev]);
  };

  const clearConversations = () => setConversations([]);

  return (
    <ChatContext.Provider value={{ conversations, addConversation, clearConversations, activeMode, setActiveMode }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
