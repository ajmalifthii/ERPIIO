import { supabase } from './supabaseClient';
import { UserProfile } from '../types';

export const fetchUserProfiles = async (): Promise<UserProfile[]> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*');

    if (error) {
        console.error('Error fetching user profiles:', error);
        throw error;
    }
    return data || [];
};

export const inviteUser = async (email: string, role: string) => {
  const { data, error } = await supabase.functions.invoke('invite-user', {
    body: { email },
  });

  if (error) throw error;
  if (!data.user) throw new Error('User not created');

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: role })
    .eq('id', data.user.id);

  if (profileError) throw profileError;

  return data;
};

export const updateUserRole = async (userId: string, role: string) => {
  const { data, error } = await supabase.functions.invoke('update-user-role', {
    body: { userId, role },
  });

  if (error) throw error;

  return data;
};

export const deleteUser = async (userId: string) => {
    const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId },
    });

    if (error) throw error;

    return data;
}
