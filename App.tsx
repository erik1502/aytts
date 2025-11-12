import React, { useState } from 'react';

// --- ICONS ---
const LifebuoyIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" />
        <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
        <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
        <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
        <line x1="14.83" y1="9.17" x2="18.36" y2="5.64" />
        <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
    </svg>
);

const MedicalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2L12 22" /><path d="M22 12L2 12" /><path d="M20 17.32a9 9 0 10-16 0" /></svg>
);

const FoodIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 21v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4" /><path d="M6 17H4a2 2 0 00-2 2v2" /><path d="M18 17h2a2 2 0 012 2v2" /><path d="M16 11.23a4 4 0 10-8 0" /><path d="M12 21V11" /></svg>
);

const RescueIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 8L22 12L18 16" /><path d="M2 12H22" /><path d="M13 2L3 14H11L9 22L19 10H11L13 2Z" /></svg>
);


const LoadingSpinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

type HelpType = 'Medical' | 'Food' | 'Rescue';
type AppState = 'idle' | 'requesting' | 'submitting' | 'submitted' | 'error';
type Location = { lat: number; lon: number };

const HELP_TYPES: { id: HelpType; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { id: 'Medical', label: 'Medical', icon: MedicalIcon },
    { id: 'Food', label: 'Food/Water', icon: FoodIcon },
    { id: 'Rescue', label: 'Rescue', icon: RescueIcon },
];

function App() {
    const [appState, setAppState] = useState<AppState>('idle');
    const [selectedHelpType, setSelectedHelpType] = useState<HelpType | null>(null);
    const [details, setDetails] = useState('');
    const [location, setLocation] = useState<Location | null>(null);
    const [locationError, setLocationError] = useState('');
    const [error, setError] = useState('');
    const [ticketId, setTicketId] = useState('');

    const handleGetLocation = () => {
        setLocationError('');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                });
            },
            (err) => {
                setLocationError('Could not get location. Please enable location services.');
                console.error(err);
            }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedHelpType || !location) return;

        setAppState('submitting');
        setError('');

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            // In a real app, you would send this data to a server.
            console.log({
                type: selectedHelpType,
                details,
                location,
            });
            setTicketId(`BAYANIHAN-${Date.now().toString().slice(-6)}`);
            setAppState('submitted');
        } catch (err) {
            setError('Failed to submit request. Please check your connection and try again.');
            setAppState('error');
        }
    };
    
    const resetForm = () => {
        setAppState('idle');
        setSelectedHelpType(null);
        setDetails('');
        setLocation(null);
        setLocationError('');
        setError('');
        setTicketId('');
    };

    const renderContent = () => {
        switch (appState) {
            case 'requesting':
                return (
                    <form onSubmit={handleSubmit} className="w-full animate-fade-in">
                        <div className="bg-gray-800/50 p-6 rounded-xl shadow-2xl shadow-black/30 border border-gray-700">
                            <fieldset>
                                <legend className="text-xl font-semibold text-center mb-4 text-gray-300">What help do you need?</legend>
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    {HELP_TYPES.map(({ id, label, icon: Icon }) => (
                                        <button
                                            type="button"
                                            key={id}
                                            onClick={() => setSelectedHelpType(id)}
                                            className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 ${selectedHelpType === id ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}
                                            aria-pressed={selectedHelpType === id}
                                        >
                                            <Icon className="w-8 h-8" />
                                            <span className="font-semibold">{label}</span>
                                        </button>
                                    ))}
                                </div>
                            </fieldset>

                            <div className="mb-6">
                                <label htmlFor="details-textarea" className="block mb-2 font-medium text-gray-400">Details (optional)</label>
                                <textarea
                                    id="details-textarea"
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    placeholder="e.g., Trapped on a roof, 2 adults, 1 child."
                                    className="w-full h-24 p-3 bg-gray-900 border-2 border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block mb-2 font-medium text-gray-400">Location</label>
                                {location ? (
                                    <div className="p-3 bg-green-900/50 border border-green-700 text-green-300 rounded-lg text-center">
                                        Location captured successfully.
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleGetLocation}
                                        className="w-full bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors"
                                    >
                                        Use My Current Location
                                    </button>
                                )}
                                {locationError && <p className="text-red-400 mt-2">{locationError}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={!selectedHelpType || !location}
                                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                Submit Request
                            </button>
                        </div>
                    </form>
                );
            case 'submitting':
                return (
                    <div className="text-center p-8 bg-gray-800/50 rounded-xl" aria-live="polite" aria-busy="true">
                        <LoadingSpinner />
                        <p className="mt-4 text-lg">Submitting your request...</p>
                    </div>
                );
            case 'submitted':
                return (
                    <div className="text-center p-8 bg-green-900/50 border border-green-700 rounded-xl animate-fade-in">
                        <h2 className="text-3xl font-bold text-green-300">Request Received</h2>
                        <p className="mt-2 text-gray-300">Your request has been sent to coordinators.</p>
                        <p className="mt-4 text-gray-400">Your reference number is:</p>
                        <p className="text-2xl font-mono bg-gray-900 p-2 rounded-md inline-block mt-1">{ticketId}</p>
                        <p className="mt-6 text-yellow-300">Please stay safe. Help is on the way.</p>
                        <button onClick={resetForm} className="mt-6 bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-500">
                            Request Again
                        </button>
                    </div>
                );
            case 'error':
                 return (
                    <div role="alert" className="mt-6 bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg animate-fade-in">
                        <p className="font-bold">An Error Occurred</p>
                        <p>{error}</p>
                        <button onClick={() => setAppState('requesting')} className="mt-4 bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600">
                            Try Again
                        </button>
                    </div>
                );
            case 'idle':
            default:
                return (
                    <div className="text-center animate-fade-in">
                        <p className="text-gray-400 text-xl mb-8">In case of emergency, press the button below.</p>
                        <button
                            onClick={() => setAppState('requesting')}
                            className="bg-red-600 text-white font-bold rounded-full w-48 h-48 flex items-center justify-center text-2xl shadow-lg shadow-red-900/50 hover:bg-red-500 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-400"
                            aria-label="Ask for help"
                        >
                            Ask for Help
                        </button>
                    </div>
                );
        }
    };


    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center justify-center p-4">
            <header className="w-full max-w-2xl text-center mb-8">
                <div className="flex items-center justify-center gap-3">
                    <LifebuoyIcon className="w-10 h-10 text-blue-400" />
                    <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                        BayanihanAI
                    </h1>
                </div>
                <p className="text-gray-400 mt-2">Community Emergency Response</p>
            </header>

            <main className="w-full max-w-md flex-grow flex items-center justify-center">
                {renderContent()}
            </main>

            <style>
                {`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
                `}
            </style>
        </div>
    );
}

export default App;