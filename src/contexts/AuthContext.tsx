import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { UserProfile } from '../types';

interface AuthContextType {
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true); // Ensure loading is true at the start of the effect

    const getInitialSession = async () => {
      try {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Error fetching session:', sessionError);
          // Set session to null explicitly if an error occurs
          setSession(null);
          setProfile(null);
          return; // Exit early
        }

        setSession(currentSession);

        if (currentSession?.user) {
          const { data: userProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
            setProfile(null); // Set profile to null if fetching fails
          } else {
            setProfile(userProfile || null);
          }
        } else {
          setProfile(null); // No user, so no profile
        }
      } catch (error) {
        console.error('Unexpected error in getInitialSession:', error);
        setSession(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setLoading(true); // Set loading true when auth state might change
        try {
          setSession(newSession);
          if (newSession?.user) {
            const { data: userProfile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', newSession.user.id)
              .single();

            if (profileError) {
              console.error('Error fetching profile on auth change:', profileError);
              setProfile(null);
            } else {
              setProfile(userProfile || null);
            }
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error('Unexpected error in onAuthStateChange handler:', error);
          setProfile(null); // Reset profile on error
        } finally {
          setLoading(false);
        }
      }
    );

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const value = { session, profile, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
