
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import PropertyDashboard from '../components/PropertyDashboard';

const Index = () => {
  const queryClient = useQueryClient();

  // Force refresh the deals data when the component mounts
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['deals'] });
  }, [queryClient]);

  return <PropertyDashboard />;
};

export default Index;
