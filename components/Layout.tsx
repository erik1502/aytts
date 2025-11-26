import React from 'react';
import { Profile } from '../types';
import { LogOut, ShieldAlert, Menu, User } from 'lucide-react';
import { db } from '../services/mockSupabase';

interface LayoutProps {
  children: React.ReactNode;
  user: Profile | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await db.signOut();
    onLogout();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ShieldAlert className="h-8 w-8 text-purple-600" />
              <span className="ml-2 text-xl font-bold tracking-tight text-slate-900">
                BayanihanAI
              </span>
              {user && (
                <span className="ml-4 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 uppercase tracking-wide">
                  {user.role}
                </span>
              )}
            </div>
            
            {user && (
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center text-sm text-slate-500">
                    <User className="h-4 w-4 mr-1" />
                    {user.full_name}
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </div>
            )}

            {user && (
                <div className="md:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-500 hover:text-slate-700">
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
            )}
          </div>
        </div>
        
        {/* Mobile Menu */}
        {user && isMenuOpen && (
            <div className="md:hidden bg-slate-50 border-t border-slate-200 px-4 py-4 space-y-3">
                 <div className="text-sm text-slate-600 font-medium">{user.full_name}</div>
                 <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
            </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;