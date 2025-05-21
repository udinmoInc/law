import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Bell, Heart, MessageSquare, User, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'group_invite';
  data: any;
  is_read: boolean;
  created_at: string;
}

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;

      setNotifications(data || []);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      setError(error.message || 'Failed to load notifications');
      toast.error('Failed to load notifications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      subscribeToNotifications();
    }
  }, [user]);

  const subscribeToNotifications = () => {
    if (!user) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'comment':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'follow':
        return <User className="h-5 w-5 text-green-500" />;
      case 'group_invite':
        return <Users className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationTitle = (notification: Notification) => {
    switch (notification.type) {
      case 'like':
        return 'New Like';
      case 'comment':
        return 'New Comment';
      case 'follow':
        return 'New Follower';
      case 'group_invite':
        return 'Group Invitation';
      case 'mention':
        return 'New Mention';
      default:
        return 'Notification';
    }
  };

  const getNotificationContent = (notification: Notification) => {
    switch (notification.type) {
      case 'like':
        return `${notification.data.username} liked your post`;
      case 'comment':
        return `${notification.data.username} commented on your post`;
      case 'follow':
        return `${notification.data.username} started following you`;
      case 'group_invite':
        return `You've been invited to join ${notification.data.group_name}`;
      case 'mention':
        return `${notification.data.username} mentioned you in a post`;
      default:
        return '';
    }
  };

  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case 'like':
      case 'comment':
        return `/post/${notification.data.post_id}`;
      case 'follow':
        return `/profile/${notification.data.user_id}`;
      case 'group_invite':
        return `/groups`;
      default:
        return '#';
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <Bell className="h-12 w-12 mx-auto text-gray-400" />
        <h2 className="mt-4 text-lg font-medium text-gray-900">Sign in to view notifications</h2>
        <p className="mt-2 text-gray-500">
          <Link to="/login" className="text-blue-500 hover:text-blue-600">
            Sign in
          </Link>{' '}
          to see your notifications
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-red-800">Failed to load notifications</h3>
          <p className="mt-2 text-red-600">{error}</p>
          <button
            onClick={() => fetchNotifications()}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <button
          onClick={() => fetchNotifications()}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </button>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Link
              key={notification.id}
              to={getNotificationLink(notification)}
              className={`block p-4 rounded-lg border transition-colors ${
                notification.is_read 
                  ? 'bg-white border-gray-200 hover:bg-gray-50' 
                  : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">
                    {getNotificationTitle(notification)}
                  </p>
                  <p className="mt-1 text-gray-600">
                    {getNotificationContent(notification)}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Bell className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No notifications yet</h3>
          <p className="mt-2 text-gray-500">We'll notify you when something happens!</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;