import React, { useState } from 'react';
import { db } from '../services/mockSupabase';
import { Profile } from '../types';

interface AuthProps {
  onLogin: (user: Profile) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { user, error } = await db.signIn(email);
        if (error) throw new Error(error);
        if (user) onLogin(user);
      } else {
        const { user, error } = await db.signUp(email, fullName);
        if (error) throw new Error(error);
        if (user) onLogin(user);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role: string) => {
      let demoEmail = 'citizen@resq.com';
      if (role === 'admin') demoEmail = 'admin@resq.com';
      if (role === 'responder') demoEmail = 'responder@resq.com';
      
      setLoading(true);
      const { user } = await db.signIn(demoEmail);
      if(user) onLogin(user);
      setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-10">
      <div className="p-8">
        <div className="uppercase tracking-wide text-sm text-emergency-600 font-semibold mb-1">
          {isLogin ? 'Welcome Back' : 'Join BayanihanAI'}
        </div>
        <h2 className="block mt-1 text-lg leading-tight font-medium text-black">
          {isLogin ? 'Sign in to your account' : 'Create a Citizen account'}
        </h2>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                focus:outline-none focus:border-emergency-500 focus:ring-1 focus:ring-emergency-500"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700">Email Address</label>
            <input
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
              focus:outline-none focus:border-emergency-500 focus:ring-1 focus:ring-emergency-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emergency-600 hover:bg-emergency-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emergency-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-slate-600 hover:text-emergency-600"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
      
      {/* Demo Section */}
      <div className="bg-slate-50 p-4 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center mb-3">Quick Login (Demo)</p>
          <div className="flex gap-2 justify-center">
              <button onClick={() => demoLogin('citizen')} className="px-2 py-1 text-xs bg-white border border-slate-300 rounded shadow-sm hover:bg-slate-100">Citizen</button>
              <button onClick={() => demoLogin('responder')} className="px-2 py-1 text-xs bg-white border border-slate-300 rounded shadow-sm hover:bg-slate-100">Responder</button>
              <button onClick={() => demoLogin('admin')} className="px-2 py-1 text-xs bg-white border border-slate-300 rounded shadow-sm hover:bg-slate-100">Admin</button>
          </div>
      </div>
    </div>
  );
};

export default Auth;