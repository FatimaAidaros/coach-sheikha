import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, hasSupabase } from '../lib/supabase';

const AuthContext = createContext({
  session: null,
  user: null,
  isAdmin: false,
  loading: true,
  signIn: async () => {},
  signOut: async () => {}
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  async function checkAdminRole(userId) {
    if (!hasSupabase || !userId) {
      setIsAdmin(false);
      return false;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching profile:', error.message);
      }
      const admin = data?.role === 'admin';
      setIsAdmin(admin);
      return admin;
    } catch (err) {
      console.error('checkAdminRole error:', err);
      setIsAdmin(false);
      return false;
    }
  }

  useEffect(() => {
    if (!hasSupabase) {
      // Offline mode check
      const localAdmin = localStorage.getItem('coach_demo_admin') === 'true';
      setIsAdmin(localAdmin);
      setLoading(false);
      return;
    }

    // 1. Initial session fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminRole(session.user.id).finally(() => setLoading(false));
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    // 2. Auth state change subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        await checkAdminRole(currentSession.user.id);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    if (!hasSupabase) {
      // Local demo mode for previewing dashboard before Supabase variables are set
      if (email && password) {
        localStorage.setItem('coach_demo_admin', 'true');
        setIsAdmin(true);
        return { data: { user: { email } }, error: null };
      }
      return { error: { message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' } };
    }
    const res = await supabase.auth.signInWithPassword({ email, password });
    if (res.data?.user) {
      const isAuthorized = await checkAdminRole(res.data.user.id);
      if (!isAuthorized) {
        // Sign out if not admin
        await supabase.auth.signOut();
        return {
          error: {
            message: 'عذراً، هذا الحساب ليس لديه صلاحيات الإدارة (Admin Role).'
          }
        };
      }
    }
    return res;
  };

  const signOut = async () => {
    localStorage.removeItem('coach_demo_admin');
    setIsAdmin(false);
    setSession(null);
    setUser(null);
    if (hasSupabase) {
      await supabase.auth.signOut();
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, loading, signIn, signOut, hasSupabase }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
