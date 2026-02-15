
import React, { useState } from 'react';
import { NotificationType } from '../types';

interface ProfileViewProps {
    notify: (type: NotificationType, message: string) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ notify }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [orgName, setOrgName] = useState('EduFlow AI Logistics');
    const [email, setEmail] = useState('admin@eduflow-ai.com');
    const [phone, setPhone] = useState('+1 (555) 123-4567');
    const [region, setRegion] = useState('North America - East');

    const handleClearData = () => {
        if (confirm("Are you sure you want to clear all local data? This cannot be undone.")) {
            localStorage.clear();
            notify('success', 'System data cleared. Reloading...');
            setTimeout(() => window.location.reload(), 1500);
        }
    };

    const handleSave = () => {
        setIsEditing(false);
        notify('success', 'Profile updated successfully.');
    };

    return (
        <div className="min-h-screen bg-background animate-fade-in pb-20">

            {/* Hero Header */}
            <div className="relative h-64 bg-gradient-to-r from-indigo-900 via-purple-900 to-background overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <i className="fa-solid fa-hurricane text-9xl animate-spin-reverse-slow"></i>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 -mt-24 relative z-10">

                <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
                    <div className="relative group">
                        <div className="w-40 h-40 rounded-3xl bg-surface border-4 border-surface shadow-2xl flex items-center justify-center text-5xl text-zinc-600 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20"></div>
                            <span className="font-bold">JD</span>
                        </div>
                        <button className="absolute bottom-2 right-2 w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg hover:bg-indigo-500 transition-colors">
                            <i className="fa-solid fa-camera"></i>
                        </button>
                    </div>
                    <div className="flex-1 pb-2">
                        <h1 className="text-4xl font-black text-white tracking-tight mb-1">John Doe</h1>
                        <p className="text-zinc-400 font-medium flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Administrator
                            <span className="text-zinc-600 mx-2">???</span>
                            <span className="text-indigo-400">System Admin</span>
                        </p>
                    </div>
                    <div className="flex gap-3 pb-2">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all shadow-lg flex items-center gap-2"
                        >
                            <i className={`fa-solid ${isEditing ? 'fa-xmark' : 'fa-pen-to-square'}`}></i>
                            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column - Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-surface border border-white/5 rounded-3xl p-8 shadow-xl">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                        <i className="fa-regular fa-id-card"></i>
                                    </div>
                                    Personal Information
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Full Name</label>
                                    <input
                                        type="text"
                                        value="John Doe"
                                        disabled
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-zinc-400 cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Role</label>
                                    <input
                                        type="text"
                                        value="Super Administrator"
                                        disabled
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-zinc-400 cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        disabled={!isEditing}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all ${isEditing ? 'border-white/20 focus:ring-1 focus:ring-indigo-500' : 'border-white/5 disabled:opacity-70'}`}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Phone</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        disabled={!isEditing}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all ${isEditing ? 'border-white/20 focus:ring-1 focus:ring-indigo-500' : 'border-white/5 disabled:opacity-70'}`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface border border-white/5 rounded-3xl p-8 shadow-xl">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                        <i className="fa-solid fa-briefcase"></i>
                                    </div>
                                    Organization Details
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Company Name</label>
                                    <input
                                        type="text"
                                        value={orgName}
                                        disabled={!isEditing}
                                        onChange={(e) => setOrgName(e.target.value)}
                                        className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all ${isEditing ? 'border-white/20 focus:ring-1 focus:ring-indigo-500' : 'border-white/5 disabled:opacity-70'}`}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Region</label>
                                    <input
                                        type="text"
                                        value={region}
                                        disabled={!isEditing}
                                        onChange={(e) => setRegion(e.target.value)}
                                        className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all ${isEditing ? 'border-white/20 focus:ring-1 focus:ring-indigo-500' : 'border-white/5 disabled:opacity-70'}`}
                                    />
                                </div>
                            </div>

                            {isEditing && (
                                <div className="mt-8 pt-6 border-t border-white/5 flex justify-end gap-4">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-white font-bold transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Stats & Danger Zone */}
                    <div className="space-y-6">

                        {/* Activity Overview */}
                        <div className="bg-surface border border-white/5 rounded-3xl p-6 shadow-xl">
                            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-6">Account Statistics</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                                    <span className="text-zinc-300 font-medium">Last Login</span>
                                    <span className="text-white font-mono text-sm">Today, 09:41 AM</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                                    <span className="text-zinc-300 font-medium">Session ID</span>
                                    <span className="text-zinc-500 font-mono text-xs">#SESSION-9928</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                                    <span className="text-zinc-300 font-medium">Access Level</span>
                                    <span className="text-emerald-400 font-bold text-xs bg-emerald-500/10 px-2 py-1 rounded">ROOT_ADMIN</span>
                                </div>
                            </div>
                        </div>

                        {/* Security & Danger Zone */}
                        <div className="bg-red-500/5 border border-red-500/10 rounded-3xl p-6 shadow-xl">
                            <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                                <i className="fa-solid fa-triangle-exclamation"></i> Danger Zone
                            </h3>

                            <div className="space-y-3">
                                <button
                                    onClick={() => notify('info', 'Password reset email sent.')}
                                    className="w-full py-3 bg-surface hover:bg-white/5 border border-white/10 text-zinc-300 font-bold rounded-xl transition-all"
                                >
                                    Change Password
                                </button>

                                <button
                                    onClick={handleClearData}
                                    className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/10 font-bold rounded-xl transition-all"
                                >
                                    Clear Local Data
                                </button>
                            </div>
                            <p className="text-xs text-center text-zinc-500 mt-4 leading-relaxed px-2">
                                Clearing local data will wipe all schools, inventory items, and cached settings from this browser. This action involves data loss.
                            </p>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProfileView;
