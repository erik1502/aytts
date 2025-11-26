
import React, { useEffect, useState } from 'react';
import { Profile, Report } from '../types';
import { db } from '../services/mockSupabase';
import { MapPin, Siren, UserPlus, RefreshCcw, Flame, Droplets, HeartPulse, LifeBuoy, BarChart2, CheckCircle2, TrendingUp, Clock } from 'lucide-react';

interface AdminViewProps {
  user: Profile;
}

const AdminView: React.FC<AdminViewProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'insights'>('dashboard');
  const [reports, setReports] = useState<Report[]>([]);
  const [resolvedReports, setResolvedReports] = useState<Report[]>([]);
  const [responders, setResponders] = useState<Profile[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    const allReports = await db.getReports(undefined, 'admin');
    setReports(allReports.filter(r => r.status !== 'resolved'));
    setResolvedReports(allReports.filter(r => r.status === 'resolved'));
    const resp = await db.getResponders();
    setResponders(resp);
  };

  const handleAssign = async (responderId: string) => {
    if (!selectedReport) return;
    await db.assignResponder(selectedReport.id, responderId);
    setSelectedReport(null);
    fetchData();
  };

  const categories = [
      { id: 'fire', label: 'Fire', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
      { id: 'flood', label: 'Flood', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
      { id: 'medical', label: 'Medical', icon: HeartPulse, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
      { id: 'rescue', label: 'Rescue', icon: LifeBuoy, color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
  ];

  const getStats = () => {
      const total = resolvedReports.length;
      const fire = resolvedReports.filter(r => r.category === 'fire').length;
      const medical = resolvedReports.filter(r => r.category === 'medical').length;
      return { total, fire, medical };
  };

  const stats = getStats();

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Command Center</h1>
            <p className="text-sm text-slate-500">BayanihanAI Operational Dashboard</p>
        </div>
        
        <div className="flex space-x-2">
            <div className="bg-slate-100 p-1 rounded-lg flex text-sm font-medium">
                <button 
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-3 py-1.5 rounded-md transition-all ${activeTab === 'dashboard' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Live Ops
                </button>
                <button 
                    onClick={() => setActiveTab('insights')}
                    className={`px-3 py-1.5 rounded-md transition-all ${activeTab === 'insights' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Insights
                </button>
            </div>
            <button onClick={() => fetchData()} className="p-2 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 text-slate-700">
                <RefreshCcw className="h-5 w-5" />
            </button>
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-hidden pb-4">
            {categories.map(cat => {
                const catReports = reports.filter(r => r.category === cat.id);
                const CatIcon = cat.icon;
                return (
                    <div key={cat.id} className="flex flex-col bg-slate-50 rounded-lg border border-slate-200 h-full overflow-hidden">
                        <div className={`p-3 border-b border-slate-200 ${cat.bg} flex items-center justify-between`}>
                            <div className="flex items-center space-x-2">
                                <CatIcon className={`h-5 w-5 ${cat.color}`} />
                                <span className="font-bold text-slate-800">{cat.label}</span>
                            </div>
                            <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">{catReports.length}</span>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                            {catReports.map(report => (
                                <div key={report.id} className="bg-white p-3 rounded shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative">
                                    {report.severity === 'high' && (
                                        <div className="absolute top-0 right-0 p-1">
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                            </span>
                                        </div>
                                    )}
                                    
                                    <div className="mb-2">
                                        <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded 
                                            ${report.status === 'pending' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {report.status}
                                        </span>
                                    </div>
                                    
                                    <p className="text-sm text-slate-700 line-clamp-2 mb-2 font-medium">{report.description}</p>
                                    
                                    <div className="flex items-center text-xs text-slate-500 mb-3">
                                        <MapPin className="h-3 w-3 mr-1" /> {report.location}
                                    </div>

                                    {report.status === 'pending' ? (
                                        <button 
                                            onClick={() => setSelectedReport(report)}
                                            className="w-full py-1.5 bg-slate-800 text-white text-xs rounded font-bold hover:bg-slate-700 flex items-center justify-center"
                                        >
                                            <UserPlus className="h-3 w-3 mr-1" /> Dispatch
                                        </button>
                                    ) : (
                                        <div className="w-full py-1.5 bg-blue-50 text-blue-600 text-xs rounded font-bold flex items-center justify-center border border-blue-100">
                                            <Siren className="h-3 w-3 mr-1" /> Units Deployed
                                        </div>
                                    )}
                                </div>
                            ))}
                            {catReports.length === 0 && (
                                <div className="text-center py-10 opacity-40">
                                    <CatIcon className="h-10 w-10 mx-auto mb-2" />
                                    <span className="text-xs">No active incidents</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Resolved</h3>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900">{stats.total}</div>
                    <p className="text-sm text-green-600 mt-2 font-medium">+12% from yesterday</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Avg Response Time</h3>
                        <Clock className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900">12m 30s</div>
                    <p className="text-sm text-slate-400 mt-2">Target: &lt;15m</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Top Incident</h3>
                        <TrendingUp className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900 capitalize">
                        {stats.fire > stats.medical ? 'Fire' : 'Medical'}
                    </div>
                    <p className="text-sm text-slate-400 mt-2">High frequency zone: Downtown</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-800">Mission History</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {resolvedReports.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No completed missions yet.</div>
                    ) : (
                        resolvedReports.map(report => (
                            <div key={report.id} className="p-6 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className={`p-2 rounded-lg ${
                                            report.category === 'fire' ? 'bg-orange-100 text-orange-600' : 
                                            report.category === 'medical' ? 'bg-red-100 text-red-600' :
                                            'bg-blue-100 text-blue-600'
                                        }`}>
                                            {report.category === 'fire' && <Flame className="h-5 w-5" />}
                                            {report.category === 'medical' && <HeartPulse className="h-5 w-5" />}
                                            {report.category === 'flood' && <Droplets className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{report.description}</p>
                                            <p className="text-xs text-slate-500 flex items-center mt-1">
                                                <MapPin className="h-3 w-3 mr-1" /> {report.location}
                                                <span className="mx-2">•</span>
                                                Resolved at {new Date().toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            SUCCESS
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Assignment Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900 bg-opacity-75 transition-opacity" onClick={() => setSelectedReport(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-slate-900">Deploy Units</h3>
                  <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-500">Close</button>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                   <p className="text-sm text-slate-600 mb-4 bg-yellow-50 p-2 rounded border border-yellow-100">
                       Incident: <strong>{selectedReport.category.toUpperCase()}</strong> - {selectedReport.description}
                   </p>
                   <div className="space-y-2">
                        {responders.map(r => (
                            <button
                                key={r.id}
                                disabled={r.status === 'busy'}
                                onClick={() => handleAssign(r.id)}
                                className={`w-full text-left p-3 rounded-md flex justify-between items-center border transition-all ${
                                    r.status === 'idle' 
                                    ? 'border-slate-200 hover:border-blue-500 hover:shadow-md bg-white' 
                                    : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                                }`}
                            >
                                <div className="flex items-center">
                                    <div className={`h-2 w-2 rounded-full mr-3 ${r.status === 'idle' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{r.full_name}</p>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider">{r.role}</p>
                                    </div>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${
                                    r.status === 'idle' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {r.status.toUpperCase()}
                                </span>
                            </button>
                        ))}
                   </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
