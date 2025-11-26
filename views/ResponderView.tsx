
import React, { useEffect, useState } from 'react';
import { Profile, Report, Assignment } from '../types';
import { db } from '../services/mockSupabase';
import { MapPin, CheckCircle, Navigation, Radio, XCircle, Map as MapIcon, RotateCw } from 'lucide-react';

interface ResponderViewProps {
  user: Profile;
}

const ResponderView: React.FC<ResponderViewProps> = ({ user }) => {
  const [tasks, setTasks] = useState<{ assignment: Assignment; report: Report }[]>([]);
  const [status, setStatus] = useState<Profile['status']>(user.status || 'idle');
  const [activeTask, setActiveTask] = useState<{ assignment: Assignment; report: Report } | null>(null);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000); // Poll for new tasks
    return () => clearInterval(interval);
  }, [user.id]);

  const fetchTasks = async () => {
    const data = await db.getAssignments(user.id);
    setTasks(data.filter(t => t.assignment.status !== 'completed'));
    
    // Auto-select the first task if not selected (Mocking 'Opening the alert')
    if (data.length > 0 && !activeTask) {
        // Prefer 'accepted' or 'dispatched'
        const ongoing = data.find(d => d.assignment.status === 'accepted' || d.assignment.status === 'on_site');
        if (ongoing) setActiveTask(ongoing);
    }
  };

  const handleStatusToggle = async () => {
      const newStatus = status === 'idle' ? 'busy' : 'idle';
      setStatus(newStatus);
      await db.updateResponderStatus(user.id, newStatus);
  };

  const handleAccept = async (assignment: Assignment) => {
    await db.updateAssignmentStatus(assignment.id, 'accepted');
    setStatus('busy');
    await db.updateResponderStatus(user.id, 'busy');
    fetchTasks();
    // Set active task to this one
    const task = tasks.find(t => t.assignment.id === assignment.id);
    if(task) setActiveTask({...task, assignment: {...task.assignment, status: 'accepted'}});
  };

  const handleDecline = async (assignmentId: string) => {
    await db.declineAssignment(assignmentId);
    setActiveTask(null);
    fetchTasks();
  };

  const handleUpdateProgress = async (assignmentId: string, newState: Assignment['status']) => {
      await db.updateAssignmentStatus(assignmentId, newState);
      if (newState === 'completed') {
          setStatus('idle');
          await db.updateResponderStatus(user.id, 'idle');
          setActiveTask(null);
      }
      fetchTasks();
  };

  // View: Mission Map for Active Task
  if (activeTask) {
      const { report, assignment } = activeTask;
      const isPendingAccept = assignment.status === 'dispatched';
      const isEnRoute = assignment.status === 'accepted';
      const isOnSite = assignment.status === 'on_site';

      return (
        <div className="h-[calc(100vh-100px)] flex flex-col bg-slate-900 -m-6 sm:rounded-lg overflow-hidden relative">
            {/* Map Background Layer */}
            <div className="absolute inset-0 bg-slate-800 opacity-50">
                <div className="h-full w-full" style={{ 
                        backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
                        backgroundSize: '50px 50px'
                  }}></div>
            </div>

            {/* Simulated Map Elements */}
            <div className="relative flex-1 p-6">
                 {/* Victim Marker */}
                 <div className="absolute top-[20%] left-[60%] flex flex-col items-center animate-bounce">
                     <div className="bg-red-500 p-2 rounded-full border-2 border-white shadow-xl">
                         <MapPin className="h-6 w-6 text-white" />
                     </div>
                     <div className="mt-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                         Victim: {report.category}
                     </div>
                 </div>

                 {/* Responder Marker */}
                 <div className="absolute bottom-[20%] left-[20%] flex flex-col items-center">
                     <div className="bg-blue-500 p-2 rounded-full border-2 border-white shadow-xl">
                         <Navigation className="h-6 w-6 text-white transform rotate-45" />
                     </div>
                     <div className="mt-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                         You
                     </div>
                 </div>

                 {/* Route Line (Simulated SVG) */}
                 {(isEnRoute || isPendingAccept) && (
                     <svg className="absolute inset-0 h-full w-full pointer-events-none">
                         <line x1="22%" y1="78%" x2="59%" y2="23%" stroke="#3b82f6" strokeWidth="4" strokeDasharray="10 5" className="animate-pulse" />
                     </svg>
                 )}

                 {/* ETA Card */}
                 <div className="absolute top-4 left-4 bg-black bg-opacity-80 backdrop-blur-sm text-white p-4 rounded-lg border border-slate-700 shadow-xl max-w-xs">
                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Mission Data</h3>
                     <div className="mt-2 grid grid-cols-2 gap-4">
                         <div>
                             <p className="text-xs text-slate-500">ETA</p>
                             <p className="text-xl font-mono text-green-400">12m</p>
                         </div>
                         <div>
                             <p className="text-xs text-slate-500">Distance</p>
                             <p className="text-xl font-mono text-blue-400">4.2km</p>
                         </div>
                     </div>
                     <div className="mt-2 pt-2 border-t border-slate-700">
                         <p className="text-xs text-slate-300 line-clamp-2">{report.description}</p>
                     </div>
                 </div>
            </div>

            {/* Action Control Panel */}
            <div className="bg-slate-900 p-4 border-t border-slate-700 z-10">
                {isPendingAccept ? (
                    <div className="space-y-3">
                        <div className="text-center text-white font-bold animate-pulse">Incoming Assignment Request</div>
                        <div className="flex gap-3">
                            <button onClick={() => handleDecline(assignment.id)} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center justify-center">
                                <XCircle className="h-5 w-5 mr-2" /> Decline
                            </button>
                            <button onClick={() => handleAccept(assignment)} className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 mr-2" /> Accept & Go
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-3">
                        {isEnRoute && (
                            <button onClick={() => handleUpdateProgress(assignment.id, 'on_site')} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg flex items-center justify-center text-lg">
                                <MapPin className="h-6 w-6 mr-2" /> Mark Arrived
                            </button>
                        )}
                        {isOnSite && (
                            <button onClick={() => handleUpdateProgress(assignment.id, 'completed')} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-lg flex items-center justify-center text-lg">
                                <CheckCircle className="h-6 w-6 mr-2" /> Mission Complete
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
      );
  }

  // View: Idle / List
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
          <div>
              <h2 className="text-lg font-bold text-slate-900">Responder Status</h2>
              <p className="text-xs text-slate-500">{status === 'idle' ? 'Ready for deployment' : 'Currently busy'}</p>
          </div>
          <button
            onClick={handleStatusToggle}
            className={`px-4 py-2 rounded-full font-bold text-sm ${status === 'idle' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}
          >
              {status === 'idle' ? 'Online' : 'Offline'}
          </button>
      </div>

      <h2 className="text-xl font-bold text-slate-800">Pending Tasks</h2>
      
      {tasks.length === 0 ? (
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 flex flex-col items-center justify-center text-slate-400">
              <Radio className="h-12 w-12 mb-4 animate-pulse" />
              <p>Scanning for emergency calls...</p>
          </div>
      ) : (
          <div className="grid gap-4">
              {tasks.map(({ assignment, report }) => (
                  <div key={assignment.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-l-blue-500">
                      <div className="flex justify-between">
                          <h3 className="font-bold text-lg capitalize">{report.category}</h3>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full uppercase tracking-wide font-bold">
                              {assignment.status}
                          </span>
                      </div>
                      <p className="text-slate-600 mt-2">{report.description}</p>
                      <button 
                        onClick={() => setActiveTask({assignment, report})}
                        className="mt-4 w-full bg-slate-800 text-white py-2 rounded-md hover:bg-slate-700 font-medium flex items-center justify-center"
                      >
                          <MapIcon className="h-4 w-4 mr-2" /> View Mission Map
                      </button>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default ResponderView;
