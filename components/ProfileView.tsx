
import React, { useState } from 'react';

interface ProfileViewProps {
    notify: (type: 'success' | 'error' | 'info', msg: string) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ notify }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [orgName, setOrgName] = useState('EduFlow AI Logistics');
    const [email, setEmail] = useState('admin@eduflow-ai.com');
    const [phone, setPhone] = useState('+1 (555) 000-0000');
    const [region, setRegion] = useState('North America (East)');

    // Password Change State
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSave = () => {
        setIsEditing(false);
        notify('success', 'Profile updated successfully.');
    };

    const handleClearData = () => {
        if (confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            notify('error', 'New passwords do not match');
            return;
        }
        if (!currentPassword || !newPassword) {
            notify('error', 'Please fill in all fields');
            return;
        }

        try {
            const token = localStorage.getItem('vortex_token');
            const res = await fetch('/api/user/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                notify('success', 'Password updated successfully');
                setShowChangePassword(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                notify('error', data.message || 'Failed to update password');
            }
        } catch (e) {
            notify('error', 'Connection error');
        }
    };

    return (
        <div className="p-8 lg:p-12 max-w-4xl mx-auto min-h-screen animate-slide-up pb-32">
            <header className="mb-12 relative">
                <div className="absolute top-0 right-0 hidden md:block opacity-20 transform translate-x-10 -translate-y-10">
                    <div className="w-64 h-64 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full blur-[100px]"></div>
                </div>

                <h2 className="text-4xl font-black text-white tracking-tight mb-3 flex items-center gap-3">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">Settings</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent ml-6"></div>
                </h2>
                <p className="text-zinc-400 text-lg">Manage your account and organization preferences.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">

                {/* Left Column - Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-surface border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-zinc-800 to-black border-2 border-indigo-500/30 p-1 mb-4 shadow-lg mb-6 group-hover:scale-105 transition-transform duration-300">
                                <img src="https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff" alt="Profile" className="w-full h-full rounded-xl object-cover" />
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-black rounded-lg border border-white/10 flex items-center justify-center text-green-400 text-xs shadow-lg">
                                    <i className="fa-solid fa-circle-check"></i>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-1">Administrator</h3>
                            <p className="text-indigo-400 text-sm font-medium mb-6">System Operator</p>

                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isEditing ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'}`}
                            >
                                <i className={`fa-solid ${isEditing ? 'fa-check' : 'fa-pen-to-square'}`}></i>
                                {isEditing ? 'Done Editing' : 'Edit Profile'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden">
                        <i className="fa-solid fa-gem absolute -bottom-6 -right-6 text-9xl text-indigo-500/5 rotate-12"></i>
                        <h4 className="text-white font-bold mb-2 relative z-10">Pro Plan</h4>
                        <p className="text-indigo-200 text-xs mb-4 relative z-10 opacity-70">Your organization is on the enterprise tier.</p>
                        <div className="w-full bg-black/40 rounded-full h-1.5 mb-2 relative z-10 overflow-hidden">
                            <div className="absolute left-0 top-0 h-full bg-indigo-500 w-3/4"></div>
                        </div>
                        <p className="text-[10px] text-zinc-500 relative z-10">75% Usage</p>
                    </div>
                </div>

                {/* Right Column - Forms */}
                <div className="lg:col-span-2 space-y-8">

                    {/* General Information */}
                    <div className="space-y-6">
                        <div className="bg-surface border border-white/5 rounded-3xl p-8 shadow-xl">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                                        <i className="fa-solid fa-id-card"></i>
                                    </div>
                                    General Information
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                {!showChangePassword ? (
                                    <button
                                        onClick={() => setShowChangePassword(true)}
                                        className="w-full py-3 bg-surface hover:bg-white/5 border border-white/10 text-zinc-300 font-bold rounded-xl transition-all"
                                    >
                                        Change Password
                                    </button>
                                ) : (
                                    <div className="bg-black/20 p-4 rounded-xl border border-white/5 animate-fade-in">
                                        <div className="space-y-3 mb-4">
                                            <input
                                                type="password"
                                                placeholder="Current Password"
                                                value={currentPassword}
                                                onChange={e => setCurrentPassword(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                            />
                                            <input
                                                type="password"
                                                placeholder="New Password"
                                                value={newPassword}
                                                onChange={e => setNewPassword(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                            />
                                            <input
                                                type="password"
                                                placeholder="Confirm New"
                                                value={confirmPassword}
                                                onChange={e => setConfirmPassword(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setShowChangePassword(false)}
                                                className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-zinc-400"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleChangePassword}
                                                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white shadow-lg shadow-indigo-500/20"
                                            >
                                                Update
                                            </button>
                                        </div>
                                    </div>
                                )}

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
