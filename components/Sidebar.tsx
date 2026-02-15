
import React from 'react';
import { ViewMode } from '../types';

interface SidebarProps {
    currentView: ViewMode;
    onNavigate: (view: ViewMode) => void;
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isOpen, onClose, onLogout }) => {
    const navItems = [
        { id: ViewMode.DASHBOARD, label: 'Control Center', icon: 'fa-gauge-high' },
        { id: ViewMode.SCHOOLS, label: 'Schools & Dispatch', icon: 'fa-school' },
        { id: ViewMode.UPLOAD, label: 'Data Ingestion', icon: 'fa-cloud-arrow-up' },
        { id: ViewMode.INVENTORY, label: 'Inventory', icon: 'fa-box-archive' },
        // System Config removed from sidebar
    ];

    const handleNavClick = (view: ViewMode) => {
        onNavigate(view);
        onClose();
    };

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm animate-fade-in"
                    onClick={onClose}
                ></div>
            )}

            {/* Sidebar Container */}
            <div
                className={`fixed top-0 left-0 h-screen w-64 bg-surface border-r border-border z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Brand Logo */}
                <div className="p-8 pb-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        {/* Glowing Outline Vortex Logo */}
                        <div className="relative group w-10 h-10 flex items-center justify-center">
                            {/* Outer Glow Ring */}
                            <div className="absolute inset-0 rounded-xl border border-accent/50 shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all duration-500 group-hover:shadow-[0_0_25px_rgba(139,92,246,0.6)]"></div>

                            {/* Inner Background */}
                            <div className="absolute inset-[2px] rounded-[10px] bg-gradient-to-br from-[#1e1e2f] to-[#0c0c14]"></div>

                            {/* Icon with Drop Shadow Outline Effect - Spins Anticlockwise */}
                            <i className="fa-solid fa-hurricane relative z-10 text-lg text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.8)] animate-spin-reverse-slow"></i>
                        </div>

                        <div>
                            <h1 className="text-xl font-extrabold text-white tracking-tighter leading-none">VORTEX</h1>
                            <p className="text-[10px] text-accent font-bold tracking-[0.2em] uppercase mt-1">Systems</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="md:hidden text-secondary hover:text-white transition-colors">
                        <i className="fa-solid fa-xmark text-xl"></i>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 mt-8 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (typeof item.id === 'string') {
                                    handleNavClick(item.id as ViewMode);
                                }
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${currentView === item.id
                                ? 'bg-accent/10 text-white'
                                : 'text-secondary hover:text-white hover:bg-white/[0.03]'
                                }`}
                        >
                            {currentView === item.id && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r-full shadow-[0_0_10px_#8b5cf6]"></div>
                            )}
                            <i className={`fa-solid ${item.icon} w-5 text-center transition-colors ${currentView === item.id ? 'text-accent' : 'group-hover:text-white'}`}></i>
                            <span className="text-sm font-semibold tracking-tight">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* User Profile & Logout */}
                <div className="p-6 border-t border-border space-y-3">
                    <button
                        onClick={() => handleNavClick(ViewMode.PROFILE)}
                        className={`w-full glass-panel p-3 rounded-2xl flex items-center gap-3 cursor-pointer group hover:border-accent/30 transition-all text-left ${currentView === ViewMode.PROFILE ? 'border-accent/40 bg-accent/5' : ''}`}
                    >
                        <div className="w-10 h-10 rounded-full bg-surfaceHighlight flex items-center justify-center text-secondary border border-border group-hover:border-accent/20 transition-colors relative">
                            JD
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-surface rounded-full"></div>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">John Doe</p>
                            <p className="text-[10px] text-secondary font-bold uppercase tracking-widest truncate">Administrator</p>
                        </div>
                    </button>

                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 transition-all font-semibold text-sm border border-red-500/10 group"
                    >
                        <i className="fa-solid fa-arrow-right-from-bracket group-hover:-translate-x-1 transition-transform"></i>
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
