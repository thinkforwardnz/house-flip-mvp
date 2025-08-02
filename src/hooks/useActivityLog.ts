import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

export interface ActivityItem {
  id: string;
  type: string;
  user_name: string;
  user_id: string;
  action: string;
  details: string;
  timestamp: string;
  icon: string;
  color: string;
}

export const useActivityLog = () => {
  const { user } = useAuth();

  const { data: activities = [], isLoading, error } = useQuery({
    queryKey: ['activity-log', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get user's team_id for filtering team activities
      const { data: profile } = await supabase
        .from('profiles')
        .select('team_id')
        .eq('id', user.id)
        .single();

      const teamId = profile?.team_id;

      // Fetch activities from multiple tables
      const activities: ActivityItem[] = [];

      // 1. Deal activities
      const { data: deals } = await supabase
        .from('deals')
        .select(`
          id,
          created_at,
          updated_at,
          pipeline_stage,
          user_id,
          team_id,
          unified_properties!inner(address)
        `)
        .or(teamId ? `user_id.eq.${user.id},team_id.eq.${teamId}` : `user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (deals) {
        for (const deal of deals) {
          // Deal created activity
          const { data: dealCreator } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', deal.user_id)
            .single();

          const userName = dealCreator?.first_name && dealCreator?.last_name 
            ? `${dealCreator.first_name} ${dealCreator.last_name}`
            : 'Unknown User';

          activities.push({
            id: `deal-created-${deal.id}`,
            type: 'deal_created',
            user_name: userName,
            user_id: deal.user_id,
            action: 'Created new deal',
            details: `"${deal.unified_properties?.address || 'Unknown Address'}"`,
            timestamp: deal.created_at,
            icon: 'FileText',
            color: 'text-blue-600'
          });
        }
      }

      // 2. Task activities
      const { data: tasks } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          created_at,
          updated_at,
          status,
          deals!inner(
            user_id,
            team_id,
            unified_properties!inner(address)
          )
        `)
        .or(teamId ? `deals.user_id.eq.${user.id},deals.team_id.eq.${teamId}` : `deals.user_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (tasks) {
        for (const task of tasks) {
          const { data: taskCreator } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', task.deals.user_id)
            .single();

          const userName = taskCreator?.first_name && taskCreator?.last_name 
            ? `${taskCreator.first_name} ${taskCreator.last_name}`
            : 'Unknown User';

          activities.push({
            id: `task-created-${task.id}`,
            type: 'task_created',
            user_name: userName,
            user_id: task.deals.user_id,
            action: 'Created task',
            details: `"${task.title}" for ${task.deals.unified_properties?.address || 'Unknown Property'}`,
            timestamp: task.created_at,
            icon: 'CheckSquare',
            color: 'text-purple-600'
          });
        }
      }

      // 3. Offer activities
      const { data: offers } = await supabase
        .from('offers')
        .select(`
          id,
          offer_price,
          status,
          created_at,
          updated_at,
          deals!inner(
            user_id,
            team_id,
            unified_properties!inner(address)
          )
        `)
        .or(teamId ? `deals.user_id.eq.${user.id},deals.team_id.eq.${teamId}` : `deals.user_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (offers) {
        for (const offer of offers) {
          const { data: offerCreator } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', offer.deals.user_id)
            .single();

          const userName = offerCreator?.first_name && offerCreator?.last_name 
            ? `${offerCreator.first_name} ${offerCreator.last_name}`
            : 'Unknown User';

          const formattedPrice = new Intl.NumberFormat('en-NZ', {
            style: 'currency',
            currency: 'NZD',
            minimumFractionDigits: 0
          }).format(offer.offer_price);

          activities.push({
            id: `offer-${offer.status}-${offer.id}`,
            type: `offer_${offer.status}`,
            user_name: userName,
            user_id: offer.deals.user_id,
            action: offer.status === 'accepted' ? 'Offer accepted' : 'Submitted offer',
            details: `${formattedPrice} for ${offer.deals.unified_properties?.address || 'Unknown Property'}`,
            timestamp: offer.created_at,
            icon: 'DollarSign',
            color: offer.status === 'accepted' ? 'text-green-600' : 'text-yellow-600'
          });
        }
      }

      // 4. Document activities
      const { data: documents } = await supabase
        .from('documents')
        .select(`
          id,
          file_name,
          created_at,
          uploaded_by,
          deals!inner(
            user_id,
            team_id,
            unified_properties!inner(address)
          )
        `)
        .or(teamId ? `deals.user_id.eq.${user.id},deals.team_id.eq.${teamId}` : `deals.user_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (documents) {
        for (const doc of documents) {
          const { data: uploader } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', doc.uploaded_by || doc.deals.user_id)
            .single();

          const userName = uploader?.first_name && uploader?.last_name 
            ? `${uploader.first_name} ${uploader.last_name}`
            : 'Unknown User';

          activities.push({
            id: `document-uploaded-${doc.id}`,
            type: 'document_uploaded',
            user_name: userName,
            user_id: doc.uploaded_by || doc.deals.user_id,
            action: 'Uploaded document',
            details: `${doc.file_name || 'Unknown File'} for ${doc.deals.unified_properties?.address || 'Unknown Property'}`,
            timestamp: doc.created_at,
            icon: 'FileText',
            color: 'text-orange-600'
          });
        }
      }

      // Sort all activities by timestamp (most recent first)
      return activities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, 50); // Limit to 50 most recent activities
    },
    enabled: !!user?.id,
  });

  // Calculate activity summary
  const { data: summary = {}, isLoading: summaryLoading } = useQuery({
    queryKey: ['activity-summary', user?.id],
    queryFn: async () => {
      if (!user?.id) return {};

      const { data: profile } = await supabase
        .from('profiles')
        .select('team_id')
        .eq('id', user.id)
        .single();

      const teamId = profile?.team_id;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Count deals created in last 30 days
      const { count: dealsCount } = await supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })
        .or(teamId ? `user_id.eq.${user.id},team_id.eq.${teamId}` : `user_id.eq.${user.id}`)
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Count offers submitted in last 30 days
      const { count: offersCount } = await supabase
        .from('offers')
        .select('deals!inner(*)', { count: 'exact', head: true })
        .or(teamId ? `deals.user_id.eq.${user.id},deals.team_id.eq.${teamId}` : `deals.user_id.eq.${user.id}`)
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Count documents uploaded in last 30 days
      const { count: documentsCount } = await supabase
        .from('documents')
        .select('deals!inner(*)', { count: 'exact', head: true })
        .or(teamId ? `deals.user_id.eq.${user.id},deals.team_id.eq.${teamId}` : `deals.user_id.eq.${user.id}`)
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Count team members (only for team users)
      let teamMembersCount = 0;
      if (teamId) {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('team_id', teamId)
          .gte('created_at', thirtyDaysAgo.toISOString());
        teamMembersCount = count || 0;
      }

      return {
        dealsCreated: dealsCount || 0,
        offersSubmitted: offersCount || 0,
        documentsUploaded: documentsCount || 0,
        teamMembersAdded: teamMembersCount
      };
    },
    enabled: !!user?.id,
  });

  return {
    activities,
    summary,
    isLoading: isLoading || summaryLoading,
    error
  };
};