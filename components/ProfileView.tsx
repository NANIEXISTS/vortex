
import React, { useState } from 'react';
import { NotificationType } from '../types';

interface ProfileViewProps {
  notify: (type: NotificationType, message: string) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ notify }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [orgName, setOrgName] = useState('EduFlow AI Logistics');
  const [email, setEmail] = useState('admin@eduflow-ai.com');

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
    <div className="p-8 lg:p-12 max-w-4xl mx-auto min-h-screen animate-slide-up">
      <header className="mb-12">
        <h2 className="text-4xl font-bold text-white tracking-tight mb-2">Settings</h2>
        <p className="text-zinc-400">Manage your account and organization preferences.</p>
      </header>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="bg-[#0e0e11] border border-white/5 rounded-3xl p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center text-3xl text-zinc-400 border-2 border-white/5">
              JD
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-4 border-[#0e0e11] rounded-full"></div>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white">John Doe</h3>
            <p className="text-zinc-500">Administrator • Global Distribution</p>
            <div className="flex gap-2 mt-4">
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
                PRO Plan
              </span>
              <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs font-bold border border-white/5">
                ID: #88392
              </span>
            </div>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="px-6 py-2 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-colors"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>

        {/* Details Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0e0e11] border border-white/5 rounded-3xl p-8">
            <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <i className="fa-solid fa-building-user text-zinc-500"></i> Organization
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Company Name</label>
                <input 
                  type="text" 
                  value={orgName}
                  disabled={!isEditing}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Business Email</label>
                <input 
                  type="email" 
                  value={email}
                  disabled={!isEditing}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
              </div>
              {isEditing && (
                <button onClick={handleSave} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/20">
                  Save Changes
                </button>
              )}
            </div>
          </div>

          <div className="bg-[#0e0e11] border border-white/5 rounded-3xl p-8 flex flex-col justify-between">
            <div>
                <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <i className="fa-solid fa-shield-halved text-zinc-500"></i> Security & Data
                </h4>
                <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                    Your data is stored locally in your browser for privacy. 
                    Clearing data will remove all imported schools and inventory items.
                </p>
            </div>
            
            <div className="space-y-3">
                 <button className="w-full py-3 border border-white/10 hover:bg-white/5 text-zinc-300 font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                    <i className="fa-solid fa-key"></i> Change Password
                </button>
                <button 
                onClick={handleClearData}
                className="w-full py-3 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                <i className="fa-solid fa-trash-can"></i> Clear All System Data
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
