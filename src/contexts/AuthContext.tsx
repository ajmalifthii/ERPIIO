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
    const getInitialSession = async () => {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);

        if (currentSession?.user) {
            const { data: userProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentSession.user.id)
                .single();
            setProfile(userProfile || null);
        }
        setLoading(false);
    };
    
    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newSession.user.id)
            .single();
          setProfile(userProfile || null);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
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
