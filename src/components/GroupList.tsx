import React, { useState, useEffect } from 'react';
import { supabase, type Group, type GroupMember } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Users, Lock, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import InviteGroupMember from './InviteGroupMember';

const GroupList: React.FC = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<(Group & { members: GroupMember[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserGroups();
    }
  }, [user]);

  const fetchUserGroups = async () => {
    if (!user) return;

    try {
      // First, get the groups the user is a member of
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      const groupIds = memberData.map(m => m.group_id);

      if (groupIds.length === 0) {
        setGroups([]);
        return;
      }

      // Then fetch the full group details and member counts
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select(`
          id,
          title,
          description,
          cover_image_url,
          is_private,
          created_at,
          updated_at,
          members:group_members(count)
        `)
        .in('id', groupIds);

      if (groupError) throw groupError;

      const processedGroups = groupData?.map(group => ({
        ...group,
        members: group.members || []
      })) || [];

      setGroups(processedGroups);
    } catch (error: any) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Your Groups</h2>
      {groups.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {group.cover_image_url && (
                <div className="h-32 bg-gray-100">
                  <img
                    src={group.cover_image_url}
                    alt={group.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{group.title}</h3>
                  {group.is_private ? (
                    <Lock className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Globe className="h-4 w-4 text-gray-500" />
                  )}
                </div>
                {group.description && (
                  <p className="mt-2 text-sm text-gray-600">{group.description}</p>
                )}
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{(group.members as any)[0]?.count || 0} members</span>
                </div>

                <button
                  onClick={() => setSelectedGroupId(selectedGroupId === group.id ? null : group.id)}
                  className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {selectedGroupId === group.id ? 'Cancel Invite' : 'Invite Members'}
                </button>

                {selectedGroupId === group.id && (
                  <InviteGroupMember groupId={group.id} groupTitle={group.title} />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
          <Users className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No groups yet</h3>
          <p className="mt-1 text-gray-500">Create or join a group to get started</p>
        </div>
      )}
    </div>
  );
};

export default GroupList;