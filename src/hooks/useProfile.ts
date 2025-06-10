import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';
import type { Database } from '@/integrations/supabase/types';
import { useEffect } from 'react';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: Database['public']['Enums']['user_role'] | null;
  team_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useProfile = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: profile, isLoading, error } = useQuery<UserProfile | null>({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) {
        throw error;
      }
      return data as UserProfile;
    },
  });

  useEffect(() => {
    if (error) {
      let message = 'Failed to fetch profile';
      if (error instanceof Error) message = error.message;
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  }, [error, toast]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    },
  });

  useEffect(() => {
    if (updateProfileMutation.error) {
      let message = 'Failed to update profile';
      if (updateProfileMutation.error instanceof Error) message = updateProfileMutation.error.message;
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  }, [updateProfileMutation.error, toast]);

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
  };
};
