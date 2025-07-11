import { supabase } from './supabaseClient';

export const logActivity = async (action: string, details: Record<string, any> = {}) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const activityData = {
    user_id: user?.id,
    user_email: user?.email,
    action,
    details,
  };
  
  const { error } = await supabase.from('activity_log').insert([activityData]);
  
  if (error) {
    console.error('Error logging activity:', error);
  }
};
