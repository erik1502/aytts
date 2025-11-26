import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import Layout from './components/Layout';
import Auth from './components/Auth';
import CitizenView from './views/CitizenView';
import AdminView from './views/AdminView';
import ResponderView from './views/ResponderView';
import { Profile } from './types';
import { db } from './services/mockSupabase';

const App: React.FC = () => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const session = db.getSession();
    if (session) {
      setUser(session);
    }
    setLoading(false);
  }, []);

  const handleLogin = (loggedInUser: Profile) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading BayanihanAI...</div>;
  }

  const renderView = () => {
    if (!user) return <Auth onLogin={handleLogin} />;

    switch (user.role) {
      case 'admin':
        return <AdminView user={user} />;
      case 'responder':
        return <ResponderView user={user} />;
      case 'citizen':
      default:
        return <CitizenView user={user} />;
    }
  };

  return (
    <HashRouter>
      <Layout user={user} onLogout={handleLogout}>
        {renderView()}
      </Layout>
    </HashRouter>
  );
};

export default App;