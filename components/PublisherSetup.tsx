
import React, { useState, useEffect } from 'react';
import { NotificationType } from '../types';

interface PublisherSetupProps {
  initialPublishers?: string[];
  onComplete: (publishers: string[]) => void;
  notify: (type: NotificationType, message: string) => void;
}

const DEFAULT_PUBLISHERS = [
  "Oxford University Press",
  "Cambridge University Press",
  "Pearson Education",
  "S. Chand Publishing",
  "Navneet Education",
  "Madhubun Educational Books",
  "Macmillan Education",
  "Orient Blackswan"
];

const PublisherSetup: React.FC<PublisherSetupProps> = ({ initialPublishers, onComplete, notify }) => {
  const [publishers, setPublishers] = useState<string[]>(initialPublishers || DEFAULT_PUBLISHERS);
  const [newPub, setNewPub] = useState('');

  // Sync if initialPublishers changes (e.g. freshly loaded from storage)
  useEffect(() => {
    if (initialPublishers && initialPublishers.length > 0) {
        setPublishers(initialPublishers);
    }
  }, [initialPublishers]);

  const addPublisher = () => {
    if (newPub.trim() && !publishers.includes(newPub.trim())) {
      setPublishers([...publishers, newPub.trim()]);
      setNewPub('');
    }
  };

  const removePublisher = (pub: string) => {
    setPublishers(publishers.filter(p => p !== pub));
  };

  const handleSave = () => {
    if (publishers.length === 0) {
      notify('error', 'Please add at least one publisher.');
      return;
    }
    onComplete(publishers);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in relative overflow-hidden">
      
      {/* Background Decor if in Setup Mode */}
      {!initialPublishers && (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-pulse"></div>
        </div>
      )}

      <div className="max-w-2xl w-full bg-surface border border-border rounded-3xl p-8 z-10 shadow-2xl">
        <div className="text-center mb-8">
           <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center relative">
                {/* Glowing Outline Logo */}
                <div className="absolute inset-0 rounded-2xl border-2 border-accent/50 shadow-[0_0_20px_rgba(139,92,246,0.5)]"></div>
                <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-[#1e1e2f] to-[#0c0c14]"></div>
                <i className="fa-solid fa-hurricane relative z-10 text-3xl text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.8)] animate-spin-reverse-slow"></i>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">System Configuration</h1>
          <p className="text-secondary mt-2">
            Configure your <b>Authorized Publisher List</b>. <br/>
            The AI engine uses this strictly for data normalization.
          </p>
        </div>

        <div className="bg-background/50 rounded-2xl p-6 border border-border mb-8">
            <label className="text-xs font-bold text-accent uppercase tracking-widest mb-4 block">Defined Publishers ({publishers.length})</label>
            
            <div className="flex flex-wrap gap-2 mb-6 max-h-48 overflow-y-auto custom-scrollbar">
                {publishers.map(pub => (
                    <div key={pub} className="bg-surfaceHighlight border border-white/5 rounded-lg pl-3 pr-2 py-1.5 flex items-center gap-2 text-sm text-white group">
                        {pub}
                        <button onClick={() => removePublisher(pub)} className="text-zinc-500 hover:text-red-400 w-5 h-5 flex items-center justify-center">
                            <i className="fa-solid fa-xmark text-xs"></i>
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={newPub}
                    onChange={(e) => setNewPub(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addPublisher()}
                    placeholder="Add new publisher..."
                    className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-white focus:border-accent outline-none text-sm"
                />
                <button 
                    onClick={addPublisher}
                    disabled={!newPub.trim()}
                    className="bg-zinc-800 text-white px-4 rounded-xl hover:bg-zinc-700 disabled:opacity-50"
                >
                    <i className="fa-solid fa-plus"></i>
                </button>
            </div>
        </div>

        <button 
            onClick={handleSave}
            className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-3 text-lg"
        >
            Save Configuration <i className="fa-solid fa-check"></i>
        </button>
      </div>
    </div>
  );
};

export default PublisherSetup;
