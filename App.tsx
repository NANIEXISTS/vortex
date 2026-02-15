
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DataIngestion from './components/DataIngestion';
import InventoryView from './components/InventoryView';
import Dashboard from './components/Dashboard';
import AgentChat from './components/AgentChat';
import ProfileView from './components/ProfileView';
import SchoolDispatch from './components/SchoolDispatch';
import PublisherSetup from './components/PublisherSetup';
import ToastContainer from './components/Toast';
import { ViewMode, BookItem, School, Notification, NotificationType } from './types';

// --- Boot Animation Component ---
const BootScreen = ({ onAnimationComplete }: { onAnimationComplete: () => void }) => {
    const [stage, setStage] = useState<'enter' | 'spin' | 'exit'>('enter');

    useEffect(() => {
        // Stage 1: Zoom In (Enter)
        setTimeout(() => setStage('spin'), 800);

        // Stage 2: Spin for a bit, then Zoom Out (Exit)
        setTimeout(() => setStage('exit'), 2500);

        // Stage 3: Complete
        setTimeout(() => {
            onAnimationComplete();
        }, 3000); // Allow time for exit animation
    }, [onAnimationComplete]);

    return (
        <div className={`fixed inset-0 bg-[#050508] z-[100] flex items-center justify-center transition-opacity duration-500 ${stage === 'exit' ? 'opacity-0' : 'opacity-100'}`}>

            {/* Icon Container with Transitions */}
            <div
                className={`relative flex items-center justify-center transition-all duration-700 ease-in-out
          ${stage === 'enter' ? 'scale-0 opacity-0' : ''}
          ${stage === 'spin' ? 'scale-100 opacity-100' : ''}
          ${stage === 'exit' ? 'scale-0 opacity-0 rotate-180' : ''}
        `}
            >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-indigo-500/30 blur-[50px] rounded-full animate-pulse"></div>

                {/* The Icon - Spins Anticlockwise */}
                <div className="relative z-10">
                    <i className={`fa-solid fa-hurricane text-8xl text-white drop-shadow-[0_0_30px_rgba(139,92,246,0.6)] ${stage === 'spin' ? 'animate-spin-reverse' : ''}`} style={{ animationDuration: '3s' }}></i>
                </div>

                {/* Orbit Rings */}
                <div className={`absolute w-40 h-40 border-2 border-indigo-500/30 rounded-full ${stage === 'spin' ? 'animate-spin-reverse' : ''}`} style={{ animationDuration: '4s' }}></div>
                <div className={`absolute w-52 h-52 border border-purple-500/20 rounded-full ${stage === 'spin' ? 'animate-spin-reverse' : ''}`} style={{ animationDuration: '5s', animationDirection: 'reverse' }}></div>
            </div>
        </div>
    );
};

// --- Login Component ---
const LoginScreen = ({ onLogin, notify }: { onLogin: (token: string, user: any) => void, notify: (type: NotificationType, message: string) => void }) => {
    const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Register specific
    const [fullName, setFullName] = useState('');
    const [confirmPass, setConfirmPass] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (mode === 'login') {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: email, password })
                });
                const data = await res.json();
                if (data.success) {
                    onLogin(data.token, data.user);
                } else {
                    notify('error', 'Login Failed: ' + (data.message || 'Invalid credentials'));
                }
            } else {
                notify('info', 'Feature disabled in demo.');
            }
        } catch (err) {
            notify('error', 'Connection Error');
        } finally {
            setIsLoading(false);
        }
    };

    const getTitle = () => {
        switch (mode) {
            case 'register': return 'Create Account';
            case 'forgot': return 'Reset Password';
            default: return 'Welcome Back';
        }
    };

    const getSubtitle = () => {
        switch (mode) {
            case 'register': return 'Join the Vortex network.';
            case 'forgot': return 'We will send you a recovery link.';
            default: return 'Sign in to access the Vortex System.';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050508]">
            {/* Background Ambience */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md bg-[#161624]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 animate-slide-up">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6 group">
                        <i className="fa-solid fa-hurricane text-3xl text-white animate-spin-reverse-slow"></i>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">{getTitle()}</h1>
                    <p className="text-secondary text-sm">{getSubtitle()}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {mode === 'register' && (
                        <div className="animate-fade-in">
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Full Name</label>
                            <div className="relative">
                                <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"></i>
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-zinc-700"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Username</label>
                        <div className="relative">
                            <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"></i>
                            <input
                                type="text"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-zinc-700"
                            />
                        </div>
                    </div>

                    {mode !== 'forgot' && (
                        <div className="animate-fade-in">
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Password</label>
                            <div className="relative">
                                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"></i>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-zinc-700"
                                />
                            </div>
                        </div>
                    )}

                    {mode === 'register' && (
                        <div className="animate-fade-in">
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Confirm Password</label>
                            <div className="relative">
                                <i className="fa-solid fa-shield-halved absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"></i>
                                <input
                                    type="password"
                                    required
                                    value={confirmPass}
                                    onChange={(e) => setConfirmPass(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-zinc-700"
                                />
                            </div>
                        </div>
                    )}

                    {mode === 'login' && (
                        <div className="flex items-center justify-between text-sm animate-fade-in">
                            <label className="flex items-center gap-2 text-zinc-400 cursor-pointer hover:text-white">
                                <input type="checkbox" className="rounded border-zinc-700 bg-zinc-800 text-indigo-500 focus:ring-0" />
                                <span>Remember me</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => setMode('forgot')}
                                className="text-indigo-400 hover:text-indigo-300 font-medium"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 group mt-4"
                    >
                        {isLoading ? (
                            <i className="fa-solid fa-circle-notch fa-spin"></i>
                        ) : (
                            <>
                                <span>
                                    {mode === 'login' && 'Enter Vortex'}
                                    {mode === 'register' && 'Sign Up'}
                                    {mode === 'forgot' && 'Send Reset Link'}
                                </span>
                                <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm space-y-2">
                    {mode === 'login' && (
                        <p className="text-zinc-500">
                            New to Vortex?{' '}
                            <button onClick={() => setMode('register')} className="text-white font-bold hover:underline">Create User</button>
                        </p>
                    )}
                    {(mode === 'register' || mode === 'forgot') && (
                        <p className="text-zinc-500">
                            Already have an account?{' '}
                            <button onClick={() => setMode('login')} className="text-white font-bold hover:underline">Back to Login</button>
                        </p>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 text-center px-4">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-2">Demo Credentials</p>
                    <div className="flex justify-center gap-4 text-xs font-mono text-indigo-400">
                        <span className="bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">Username: admin</span>
                        <span className="bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">Password: password123</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

function App() {
    const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.DASHBOARD);
    const [showAiPlayground, setShowAiPlayground] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // App State Phases
    const [isBooting, setIsBooting] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [schools, setSchools] = useState<School[]>([]);
    const [items, setItems] = useState<BookItem[]>([]);
    const [publishers, setPublishers] = useState<string[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Load from API
    useEffect(() => {
        const token = localStorage.getItem('vortex_token');
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            const token = localStorage.getItem('vortex_token');
            fetch('/api/data', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => {
                    if (res.status === 401 || res.status === 403) {
                        // Token invalid
                        setIsAuthenticated(false);
                        localStorage.removeItem('vortex_token');
                        throw new Error('Unauthorized');
                    }
                    return res.json();
                })
                .then(data => {
                    if (data.schools) setSchools(data.schools);
                    if (data.items) {
                        setItems(data.items.map((i: any) => ({
                            ...i,
                            createdAt: i.createdAt ? new Date(i.createdAt) : new Date()
                        })));
                    }
                    if (data.publishers) setPublishers(data.publishers);
                })
                .catch(console.error);
        }
    }, [isAuthenticated]);

    // Notification Logic
    const notify = (type: NotificationType, message: string) => {
        const newNote: Notification = {
            id: Date.now().toString(),
            type,
            message
        };
        setNotifications(prev => [...prev, newNote]);
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleLogin = (token: string, user: any) => {
        setIsAuthenticated(true);
        localStorage.setItem('vortex_token', token);
        notify('success', `Welcome, ${user.username}!`);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('vortex_token');
        // Reset state
        setCurrentView(ViewMode.DASHBOARD);
        setSchools([]);
        setItems([]);
        setPublishers([]);
        notify('info', 'Signed out successfully.');
    };

    // Handlers
    const handleDataIngested = async (schoolName: string, newItems: Omit<BookItem, 'id' | 'schoolId'>[]) => {
        try {
            const token = localStorage.getItem('vortex_token');
            const res = await fetch('/api/ingest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ schoolName, items: newItems })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.items) {
                    setItems(data.items.map((i: any) => ({ ...i, createdAt: new Date(i.createdAt) })));
                    notify('success', 'Synced!');

                    // Refresh schools too
                    fetch('/api/data', { headers: { 'Authorization': `Bearer ${token}` } })
                        .then(r => r.json())
                        .then(d => { if (d.schools) setSchools(d.schools || []); });
                }
            } else {
                notify('error', 'Sync Failed');
            }
        } catch (e) {
            notify('error', 'Network Error');
        }
    };

    const handleDeleteItems = (itemIds: string[]) => {
        if (window.confirm(`Delete ${itemIds.length} items permanently?`)) {
            setItems(prev => prev.filter(item => !itemIds.includes(item.id)));
        }
    };

    const handleUpdateQuantity = (itemIds: string[], newQuantity: number) => {
        setItems(prev => prev.map(item =>
            itemIds.includes(item.id) ? { ...item, quantity: newQuantity } : item
        ));
    };

    const handleUpdateItemDetails = (id: string, updates: Partial<BookItem>) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, ...updates } : item
        ));
    };

    const handlePublisherSetupComplete = (newPublishers: string[]) => {
        setPublishers(newPublishers);
        setCurrentView(ViewMode.DASHBOARD);
        notify('success', 'Configuration saved successfully.');
    };

    const renderContent = () => {
        if (currentView === ViewMode.SETUP) {
            return <PublisherSetup onComplete={handlePublisherSetupComplete} notify={notify} />;
        }

        switch (currentView) {
            case ViewMode.DASHBOARD:
                return <Dashboard items={items} schools={schools} onNavigate={setCurrentView} />;
            case ViewMode.SCHOOLS:
                return <SchoolDispatch items={items} schools={schools} notify={notify} />;
            case ViewMode.UPLOAD:
                return <DataIngestion publishers={publishers} onDataIngested={handleDataIngested} notify={notify} />;
            case ViewMode.INVENTORY:
                return (
                    <InventoryView
                        items={items}
                        schools={schools}
                        onDeleteItems={handleDeleteItems}
                        onUpdateQuantity={handleUpdateQuantity}
                        onUpdateItemDetails={handleUpdateItemDetails}
                        notify={notify}
                    />
                );
            case ViewMode.CONFIG:
                return <PublisherSetup initialPublishers={publishers} onComplete={handlePublisherSetupComplete} notify={notify} />;
            case ViewMode.PROFILE:
                return <ProfileView notify={notify} />;
            default:
                return <Dashboard items={items} schools={schools} onNavigate={setCurrentView} />;
        }
    };

    // --- Main Render Flow ---

    // 1. Boot Animation (Always runs first on refresh)
    if (isBooting) {
        return <BootScreen onAnimationComplete={() => setIsBooting(false)} />;
    }

    // 2. Login Screen (If not authenticated)
    if (!isAuthenticated) {
        return (
            <>
                <LoginScreen onLogin={handleLogin} notify={notify} />
                <ToastContainer notifications={notifications} removeNotification={removeNotification} />
            </>
        );
    }

    // 3. Main App Layout
    return (
        <div className="flex h-screen bg-background text-primary font-sans overflow-hidden selection:bg-accent/30 animate-fade-in">

            {currentView !== ViewMode.SETUP && (
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="fixed top-4 left-4 z-20 md:hidden w-10 h-10 glass-panel rounded-xl flex items-center justify-center text-white shadow-lg"
                    aria-label="Toggle sidebar"
                >
                    <i className="fa-solid fa-bars"></i>
                </button>
            )}

            {currentView !== ViewMode.SETUP && (
                <Sidebar
                    currentView={currentView}
                    onNavigate={setCurrentView}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    onLogout={handleLogout}
                />
            )}

            <main className={`flex-1 overflow-auto relative h-full ${currentView !== ViewMode.SETUP ? 'md:ml-64' : ''}`}>
                <div className={`relative z-10 ${currentView !== ViewMode.SETUP ? 'pt-12 md:pt-0' : ''}`}>
                    {renderContent()}
                </div>
            </main>

            <ToastContainer notifications={notifications} removeNotification={removeNotification} />

            {currentView !== ViewMode.SETUP && !showAiPlayground && (
                <button
                    onClick={() => setShowAiPlayground(true)}
                    className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-tr from-accent to-blue-500 text-white rounded-2xl shadow-xl shadow-accent/20 transition-all duration-300 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)] flex items-center justify-center z-50 group border border-white/10 hover:scale-[1.8] hover:shadow-[0_0_80px_rgba(139,92,246,0.8)]"
                    aria-label="Open AI Assistant"
                >
                    <i className="fa-solid fa-hurricane text-xl animate-spin-reverse-slow group-hover:animate-spin-reverse"></i>
                </button>
            )}

            {showAiPlayground && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="w-full sm:w-[500px] h-[85vh] sm:h-[600px] bg-surface sm:rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative animate-slide-up flex flex-col">
                        <button
                            onClick={() => setShowAiPlayground(false)}
                            className="absolute top-4 right-4 w-8 h-8 hover:bg-white/10 rounded-full flex items-center justify-center text-secondary hover:text-white transition-colors z-20"
                            aria-label="Close AI Assistant"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                        <AgentChat items={items} schools={schools} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
