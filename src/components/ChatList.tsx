import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Search, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import ChatWindow from './ChatWindow';

interface Chat {
  id: string;
  last_message?: {
    content: string;
    created_at: string;
  };
  participants: {
    profiles: {
      username: string;
      avatar_url?: string;
    };
  }[];
}

const ChatList: React.FC = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (user) {
      fetchChats();
      subscribeToChats();
    }
  }, [user]);

  const fetchChats = async () => {
    if (!user) return;

    try {
      const { data: userChats, error: chatsError } = await supabase
        .from('chat_participants')
        .select(`
          chat_id,
          chats (
            id,
            messages (
              content,
              created_at
            )
          ),
          profiles!chat_participants_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (chatsError) throw chatsError;

      const processedChats = userChats?.map((chat) => ({
        id: chat.chat_id,
        last_message: chat.chats.messages[0],
        participants: [{ profiles: chat.profiles }],
      }));

      setChats(processedChats || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToChats = () => {
    const channel = supabase
      .channel('chats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const createChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !username.trim()) return;

    try {
      // Find user by username
      const { data: targetUser, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.trim())
        .single();

      if (userError || !targetUser) {
        toast.error('User not found');
        return;
      }

      // Create new chat
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert([{}])
        .select()
        .single();

      if (chatError) throw chatError;

      // Add participants
      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert([
          { chat_id: chat.id, user_id: user.id },
          { chat_id: chat.id, user_id: targetUser.id },
        ]);

      if (participantsError) throw participantsError;

      setUsername('');
      setShowNewChat(false);
      setSelectedChat(chat.id);
      fetchChats();
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create chat');
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="h-12 w-12 mx-auto text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Sign in to chat</h3>
        <p className="mt-2 text-gray-500">Connect with others through messages</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Chat List */}
      <div className="w-80 border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setShowNewChat(!showNewChat)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus size={20} />
            <span>New Chat</span>
          </button>

          {showNewChat && (
            <form onSubmit={createChat} className="mt-4">
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </form>
          )}
        </div>

        <div className="overflow-y-auto h-full">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : chats.length > 0 ? (
            chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`w-full p-4 text-left hover:bg-gray-50 ${
                  selectedChat === chat.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {chat.participants[0].profiles.avatar_url ? (
                      <img
                        src={chat.participants[0].profiles.avatar_url}
                        alt={chat.participants[0].profiles.username}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        {chat.participants[0].profiles.username[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {chat.participants[0].profiles.username}
                    </p>
                    {chat.last_message && (
                      <>
                        <p className="text-sm text-gray-500 truncate">
                          {chat.last_message.content}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(chat.last_message.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No chats yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 bg-gray-50">
        {selectedChat ? (
          <ChatWindow chatId={selectedChat} onClose={() => setSelectedChat(null)} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a chat or start a new conversation
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;