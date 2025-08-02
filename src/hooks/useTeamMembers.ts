import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const useTeamMembers = () => {
  const { user } = useAuth();

  const { data: teamMembers = [], isLoading, error } = useQuery<Profile[]>({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // First get the current user's profile to find their team_id
      const { data: currentUserProfile, error: profileError } = await supabase
        .from('profiles')
        .select('team_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      // If user has a team, get team members; otherwise get all users
      let query = supabase.from('profiles').select('*');
      
      if (currentUserProfile.team_id) {
        query = query.eq('team_id', currentUserProfile.team_id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });

  return {
    teamMembers,
    isLoading,
    error,
  };
};