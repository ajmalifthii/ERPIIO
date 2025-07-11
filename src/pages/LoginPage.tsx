import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Logged in successfully!');
    } catch (error: any) {
      toast.error(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    setLoading(true);
    try {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success('Check your email for the magic link!');
        setIsMagicLinkSent(true);
    } catch (error: any) {
        toast.error(`Could not send magic link: ${error.message}`);
    } finally {
        setLoading(false);
    }
  };
  
  const handlePasswordReset = async () => {
      if(!email) {
          toast.error("Please enter your email to reset password.");
          return;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/update-password`,
      });

      if(error) toast.error(error.message);
      else toast.success("Password reset link sent to your email!");
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-teal-400">LeatherERP Login</h1>
        
        {isMagicLinkSent ? (
            <div className='text-center'>
                <h3 className='text-xl'>Magic Link Sent!</h3>
                <p className='text-gray-400 mt-2'>Please check your email inbox at <span className='font-bold text-teal-400'>{email}</span> to log in.</p>
                <button onClick={() => setIsMagicLinkSent(false)} className="mt-4 text-sm text-teal-500 hover:underline">
                    Use a different email or method
                </button>
            </div>
        ) : (
            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block mb-2 text-sm font-bold text-gray-400">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" required />
                </div>
                <div>
                    <label className="block mb-2 text-sm font-bold text-gray-400">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div className="flex justify-between items-center text-sm">
                    <a href="#" onClick={handlePasswordReset} className="font-medium text-teal-500 hover:underline">Forgot password?</a>
                </div>
                <button type="submit" disabled={loading || !password} className="w-full py-2 px-4 bg-teal-600 hover:bg-teal-700 rounded-lg font-semibold text-white transition-colors duration-200 disabled:opacity-50">
                    {loading ? 'Logging in...' : 'Login with Password'}
                </button>
                 <button type="button" onClick={handleMagicLink} disabled={loading || !email} className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-lg font-semibold text-white transition-colors duration-200 disabled:opacity-50">
                    {loading ? 'Sending...' : 'Send Magic Link'}
                </button>
            </form>
        )}
      </div>
    </div>
  );
};
