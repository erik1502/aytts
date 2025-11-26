
import React, { useState, useEffect } from 'react';
import { Profile, Report, ReportCategory, EvacuationCenter, CitizenStatus, NewsItem, Assignment } from '../types';
import { db } from '../services/mockSupabase';
import { analyzeReportSeverity } from '../services/aiService';
import { MapPin, AlertTriangle, Clock, Activity, Send, Loader2, Globe, Map as MapIcon, X, Navigation, Newspaper, ShieldCheck, Droplet, Utensils, Skull, Megaphone } from 'lucide-react';

interface CitizenViewProps {
  user: Profile;
}

const CitizenView: React.FC<CitizenViewProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'report' | 'history' | 'news'>('report');
  const [reports, setReports] = useState<Report[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  
  // Form State
  const [category, setCategory] = useState<ReportCategory>('fire');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map & Status State
  const [showMap, setShowMap] = useState(false);
  const [evacCenters, setEvacCenters] = useState<EvacuationCenter[]>([]);
  const [myStatus, setMyStatus] = useState<CitizenStatus>(user.citizen_status || 'safe');
  
  // Rescue Tracking State
  const [activeRescueAssignment, setActiveRescueAssignment] = useState<Assignment | null>(null);

  const fetchData = async () => {
    if (activeTab === 'history') {
      const data = await db.getReports(user.id, user.role);
      setReports(data);
      
      // Check if any active report has an assignment
      const activeReport = data.find(r => r.status === 'assigned');
      if (activeReport) {
          const assignment = await db.getAssignmentByReportId(activeReport.id);
          if (assignment && (assignment.status === 'accepted' || assignment.status === 'on_site')) {
              setActiveRescueAssignment(assignment);
          } else {
              setActiveRescueAssignment(null);
          }
      } else {
          setActiveRescueAssignment(null);
      }
    } else if (activeTab === 'news') {
        const newsData = await db.getNews();
        setNews(newsData);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll for rescue updates
    return () => clearInterval(interval);
  }, [activeTab, user.id, user.role]);

  useEffect(() => {
    if (!location && activeTab === 'report') {
        attemptAutoLocation();
    }
  }, [activeTab]);

  useEffect(() => {
      const loadCenters = async () => {
          const centers = await db.getEvacuationCenters();
          setEvacCenters(centers);
      };
      loadCenters();
  }, []);

  const attemptAutoLocation = () => {
      setIsLocating(true);
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
            setIsLocating(false);
          },
          (error) => {
            console.log("Auto-location failed or denied", error);
            setIsLocating(false);
          }
        );
      } else {
        setIsLocating(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !location) {
        alert("Please provide a description and location");
        return;
    }

    setIsSubmitting(true);
    const analysis = await analyzeReportSeverity(description, category);
    
    await db.createReport({
      user_id: user.id,
      category,
      description,
      location,
      severity: analysis.severity,
      ai_analysis: analysis.reason
    });

    setIsSubmitting(false);
    setDescription('');
    alert('Report submitted successfully. Help is being coordinated.');
    setActiveTab('history');
  };

  const handleStatusChange = async (status: CitizenStatus) => {
      setMyStatus(status);
      await db.updateCitizenStatus(user.id, status);
  };

  // Helper for Status UI
  const getStatusColor = (s: CitizenStatus) => {
      switch(s) {
          case 'safe': return 'bg-green-500';
          case 'need_food': return 'bg-orange-500';
          case 'need_water': return 'bg-blue-400';
          case 'in_danger': return 'bg-red-600';
      }
  };

  const hasRescueIncoming = !!activeRescueAssignment;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex rounded-md shadow-sm" role="group">
        <button
          onClick={() => setActiveTab('report')}
          className={`flex-1 px-2 py-2 text-xs sm:text-sm font-medium border rounded-l-lg ${
            activeTab === 'report' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-700 border-slate-300'
          }`}
        >
          Report
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-2 py-2 text-xs sm:text-sm font-medium border-t border-b ${
            activeTab === 'history' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-700 border-slate-300'
          }`}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab('news')}
          className={`flex-1 px-2 py-2 text-xs sm:text-sm font-medium border rounded-r-lg ${
            activeTab === 'news' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-700 border-slate-300'
          }`}
        >
          News
        </button>
      </div>

      {activeTab === 'report' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <AlertTriangle className="h-6 w-6 text-purple-500 mr-2" />
            Report Incident
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700">Type of Incident</label>
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(['fire', 'medical', 'flood', 'rescue'] as const).map((cat) => (
                  <div
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`cursor-pointer text-center rounded-md py-3 px-3 text-sm font-bold uppercase tracking-wide border transition-all ${
                      category === cat 
                        ? 'bg-purple-50 border-purple-500 text-purple-700 ring-2 ring-purple-500' 
                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <textarea
                rows={4}
                required
                className="mt-1 block w-full shadow-sm sm:text-sm border border-slate-300 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500 bg-white text-slate-900 placeholder:text-slate-400 font-medium"
                placeholder="Describe the situation clearly (e.g., trapped on 2nd floor, water rising)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Your Location</label>
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-3 rounded-md">
                <MapPin className={`h-5 w-5 ${location ? 'text-green-600' : 'text-slate-400'}`} />
                <span className="text-sm font-medium text-slate-700 flex-1 truncate">
                    {isLocating ? 'Locating...' : (location || 'Waiting for location...')}
                </span>
                {!location && !isLocating && (
                    <button type="button" onClick={attemptAutoLocation} className="text-xs text-blue-600 hover:underline font-semibold">
                        Retry
                    </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {isSubmitting ? (
                 <><Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" /> Sending...</>
              ) : (
                 <><Send className="-ml-1 mr-3 h-5 w-5" /> SUBMIT REQUEST</>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
             <button onClick={() => setShowMap(true)} className="inline-flex items-center justify-center space-x-2 text-action-600 hover:text-action-700 transition-colors w-full">
                 <div className={`p-3 rounded-lg flex items-center w-full justify-center ${hasRescueIncoming ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-blue-50'}`}>
                     <Globe className="h-6 w-6 mr-3" />
                     <div className="text-left">
                         <span className="block text-sm font-bold text-slate-900">
                             {hasRescueIncoming ? 'TRACK RESCUER' : 'View Live Resources Map'}
                         </span>
                         <span className="block text-xs text-slate-500">
                             {hasRescueIncoming ? 'Click to see live ETA' : 'Update status & check evacuation routes'}
                         </span>
                     </div>
                 </div>
             </button>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
            {reports.length === 0 && <div className="text-center py-10 text-slate-500">No reports found.</div>}
            {reports.map((report) => (
              <div key={report.id} className="bg-white shadow rounded-lg p-4 border-l-4 border-l-slate-300">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide
                      ${report.status === 'resolved' ? 'bg-green-100 text-green-800' : 
                        report.status === 'assigned' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {report.status}
                    </span>
                    <h3 className="mt-2 text-lg font-medium text-slate-900 capitalize">{report.category} Incident</h3>
                    <p className="mt-1 text-sm text-slate-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" /> {new Date(report.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                {report.status === 'assigned' && activeRescueAssignment && (
                    <button onClick={() => setShowMap(true)} className="w-full mt-4 p-3 bg-blue-50 hover:bg-blue-100 transition-colors rounded-md border border-blue-100 flex items-center justify-between group">
                         <div className="flex items-center">
                            <Navigation className="h-5 w-5 text-blue-600 mr-2" />
                            <span className="text-sm text-blue-800 font-bold">Rescuer En Route</span>
                         </div>
                         <span className="text-xs text-blue-600 font-medium group-hover:underline">View Map &rarr;</span>
                    </button>
                )}
                {report.status === 'resolved' && (
                    <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-100 flex items-center">
                         <ShieldCheck className="h-5 w-5 text-green-600 mr-2" />
                         <span className="text-sm text-green-800 font-medium">Mission Completed. Stay Safe.</span>
                    </div>
                )}
              </div>
            ))}
        </div>
      )}

      {activeTab === 'news' && (
          <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 px-1">Current News & Alerts</h2>
              {news.map(item => (
                  <div key={item.id} className={`bg-white shadow rounded-lg overflow-hidden border-l-4 ${item.type === 'alert' ? 'border-l-red-500' : 'border-l-blue-500'}`}>
                      <div className="p-4">
                          <div className="flex items-start justify-between">
                              <div className="flex items-center">
                                  {item.type === 'alert' ? <Megaphone className="h-5 w-5 text-red-500 mr-2" /> : <Newspaper className="h-5 w-5 text-blue-500 mr-2" />}
                                  <span className="text-xs font-bold uppercase text-slate-500">{item.source}</span>
                              </div>
                              <span className="text-xs text-slate-400">{new Date(item.timestamp).toLocaleDateString()}</span>
                          </div>
                          <h3 className="mt-2 text-lg font-bold text-slate-900">{item.title}</h3>
                          <p className="mt-1 text-sm text-slate-600">{item.summary}</p>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* Interactive Map Modal */}
      {showMap && (
          <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900 flex flex-col">
              <div className="flex items-center justify-between p-4 bg-white shadow-md z-10">
                  <h3 className="font-bold text-lg text-slate-800 flex items-center">
                      <MapIcon className="mr-2 h-5 w-5 text-blue-600" />
                      {hasRescueIncoming ? 'Rescue Tracking' : 'Live Map'}
                  </h3>
                  <button onClick={() => setShowMap(false)} className="p-2 rounded-full hover:bg-slate-100">
                      <X className="h-6 w-6 text-slate-600" />
                  </button>
              </div>
              
              <div className="flex-1 relative bg-slate-100 overflow-hidden">
                  <div className="absolute inset-0 opacity-10" style={{ 
                        backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                  }}></div>

                  {hasRescueIncoming ? (
                      // RESCUE MODE MAP
                      <>
                        {/* Victim (You) Marker */}
                        <div className="absolute top-[20%] left-[60%] flex flex-col items-center animate-bounce z-20">
                            <div className="bg-red-500 p-2 rounded-full border-2 border-white shadow-xl">
                                <MapPin className="h-6 w-6 text-white" />
                            </div>
                            <div className="mt-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                YOU
                            </div>
                        </div>

                        {/* Responder Marker */}
                        <div className="absolute bottom-[20%] left-[20%] flex flex-col items-center z-20 transition-all duration-1000 ease-linear">
                            <div className="bg-blue-500 p-2 rounded-full border-2 border-white shadow-xl">
                                <Navigation className="h-6 w-6 text-white transform rotate-45" />
                            </div>
                            <div className="mt-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                RESCUER
                            </div>
                        </div>

                        {/* Route Line */}
                        <svg className="absolute inset-0 h-full w-full pointer-events-none z-10">
                            <line x1="22%" y1="78%" x2="59%" y2="23%" stroke="#3b82f6" strokeWidth="4" strokeDasharray="10 5" className="animate-pulse" />
                        </svg>

                        {/* ETA Card Overlay */}
                        <div className="absolute bottom-6 left-4 right-4 bg-white rounded-lg shadow-xl p-4 border border-slate-200 z-30">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Estimated Arrival</p>
                                    <p className="text-2xl font-bold text-slate-900">12 mins</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Status</p>
                                    <p className="text-sm font-bold text-blue-600 animate-pulse">EN ROUTE</p>
                                </div>
                            </div>
                            <div className="mt-3 bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div className="bg-blue-500 h-full w-2/3 rounded-full"></div>
                            </div>
                        </div>
                      </>
                  ) : (
                      // STANDARD RESOURCE MAP
                      <>
                        {/* You (Center) */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
                            <div className={`h-6 w-6 ${getStatusColor(myStatus)} rounded-full border-4 border-white shadow-lg animate-pulse`}></div>
                            <span className="text-xs font-bold bg-white px-2 py-0.5 rounded shadow mt-1">YOU</span>
                        </div>

                        {/* Evac Centers */}
                        {evacCenters.map((center, idx) => {
                            const positions = [{ top: '30%', left: '70%' }, { top: '60%', left: '20%' }, { top: '20%', left: '30%' }];
                            const pos = positions[idx % positions.length];
                            return (
                                <div key={center.id} className="absolute flex flex-col items-center group" style={pos}>
                                    <div className="bg-green-100 p-1.5 rounded-lg border-2 border-green-500 shadow-lg"><div className="h-4 w-4 bg-green-500 rounded-sm"></div></div>
                                    <span className="text-[10px] font-bold bg-white px-1.5 py-0.5 rounded shadow mt-1 whitespace-nowrap text-green-800">{center.name}</span>
                                </div>
                            );
                        })}
                      </>
                  )}
              </div>

              {/* Status Selector Panel (Only show in Standard Mode) */}
              {!hasRescueIncoming && (
                  <div className="bg-white p-4 pb-8 border-t border-slate-200 z-10 shadow-[0_-5px_15px_rgba(0,0,0,0.1)]">
                      <p className="text-sm font-bold text-slate-700 mb-3 text-center uppercase tracking-wide">Update Your Status</p>
                      <div className="grid grid-cols-4 gap-2">
                          <button onClick={() => handleStatusChange('safe')} className={`flex flex-col items-center p-2 rounded-lg border ${myStatus === 'safe' ? 'bg-green-50 border-green-500 ring-1 ring-green-500' : 'bg-slate-50 border-slate-200'}`}>
                              <ShieldCheck className={`h-6 w-6 ${myStatus === 'safe' ? 'text-green-600' : 'text-slate-400'}`} />
                              <span className="text-[10px] mt-1 font-bold">Safe</span>
                          </button>
                          <button onClick={() => handleStatusChange('need_food')} className={`flex flex-col items-center p-2 rounded-lg border ${myStatus === 'need_food' ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500' : 'bg-slate-50 border-slate-200'}`}>
                              <Utensils className={`h-6 w-6 ${myStatus === 'need_food' ? 'text-orange-600' : 'text-slate-400'}`} />
                              <span className="text-[10px] mt-1 font-bold">Food</span>
                          </button>
                          <button onClick={() => handleStatusChange('need_water')} className={`flex flex-col items-center p-2 rounded-lg border ${myStatus === 'need_water' ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-slate-50 border-slate-200'}`}>
                              <Droplet className={`h-6 w-6 ${myStatus === 'need_water' ? 'text-blue-600' : 'text-slate-400'}`} />
                              <span className="text-[10px] mt-1 font-bold">Water</span>
                          </button>
                          <button onClick={() => handleStatusChange('in_danger')} className={`flex flex-col items-center p-2 rounded-lg border ${myStatus === 'in_danger' ? 'bg-red-50 border-red-500 ring-1 ring-red-500' : 'bg-slate-50 border-slate-200'}`}>
                              <Skull className={`h-6 w-6 ${myStatus === 'in_danger' ? 'text-red-600' : 'text-slate-400'}`} />
                              <span className="text-[10px] mt-1 font-bold">Danger</span>
                          </button>
                      </div>
                  </div>
              )}
          </div>
      )}
    </div>
  );
};

export default CitizenView;
