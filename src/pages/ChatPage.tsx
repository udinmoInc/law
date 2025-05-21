import React from 'react';
import ChatList from '../components/ChatList';

const ChatPage: React.FC = () => {
  return (
    <div className="h-screen pt-12 md:pt-14">
      <ChatList />
    </div>
  );
};

export default ChatPage;