
import React, { useMemo } from 'react';
import { BookItem, School, ViewMode } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  items: BookItem[];
  schools: School[];
  onNavigate: (view: ViewMode) => void;
}

const COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'];

const Dashboard: React.FC<DashboardProps> = ({ items, schools, onNavigate }) => {
  
  const stats = useMemo(() => {
    const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0);
    const uniquePublishers = new Set(items.map(i => i.publisher)).size;
    
    // Recent items (last 5)
    const recentItems = [...items]
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 5);

    const publisherCounts: Record<string, number> = {};
    items.forEach(item => {
      publisherCounts[item.publisher] = (publisherCounts[item.publisher] || 0) + item.quantity;
    });

    const topPublishers = Object.entries(publisherCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return { totalItems, uniquePublishers, recentItems, topPublishers };
  }, [items]);

  return (
    <div className="p-8 lg:p-12 space-y-8 min-h-screen font-sans">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-slide-up">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Dashboard</h1>
          <p className="text-secondary font-medium">Welcome back, John. Here is your inventory overview.</p>
        </div>
      </header>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
        <div className="bg-[#161624] border border-white/5 p-6 rounded-2xl flex items-center gap-5 relative overflow-hidden group">
            <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 text-xl group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-school"></i>
            </div>
            <div>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Active Schools</p>
                <h3 className="text-3xl font-black text-white">{schools.length}</h3>
            </div>
        </div>

        <div className="bg-[#161624] border border-white/5 p-6 rounded-2xl flex items-center gap-5 relative overflow-hidden group">
            <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xl group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-book-open"></i>
            </div>
            <div>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Total Books</p>
                <h3 className="text-3xl font-black text-white">{stats.totalItems.toLocaleString()}</h3>
            </div>
        </div>

        <div className="bg-[#161624] border border-white/5 p-6 rounded-2xl flex items-center gap-5 relative overflow-hidden group">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xl group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-truck-fast"></i>
            </div>
            <div>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Publishers</p>
                <h3 className="text-3xl font-black text-white">{stats.uniquePublishers}</h3>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up [animation-delay:0.1s]">
        
        {/* Recent Activity Section (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#161624] border border-white/5 rounded-3xl p-6 min-h-[400px]">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <i className="fa-solid fa-clock-rotate-left text-zinc-500"></i> Recent Activity
                    </h3>
                </div>
                
                {stats.recentItems.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-xs text-zinc-500 uppercase bg-white/[0.02] border-b border-white/5 font-mono">
                                <tr>
                                    <th className="px-4 py-3 font-normal">Title</th>
                                    <th className="px-4 py-3 font-normal">Publisher</th>
                                    <th className="px-4 py-3 font-normal">Grade</th>
                                    <th className="px-4 py-3 font-normal text-right">Added</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {stats.recentItems.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-white/[0.02]">
                                        <td className="px-4 py-4 font-medium text-white truncate max-w-[200px]">{item.title}</td>
                                        <td className="px-4 py-4 text-zinc-400">{item.publisher}</td>
                                        <td className="px-4 py-4 text-zinc-400">{item.grade}</td>
                                        <td className="px-4 py-4 text-right text-zinc-500 text-xs">
                                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Just now'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-zinc-600">
                        <i className="fa-solid fa-clipboard-list text-3xl mb-3 opacity-50"></i>
                        <p>No recent items found.</p>
                    </div>
                )}
            </div>

            {/* Publisher Chart (Horizontal) */}
            <div className="bg-[#161624] border border-white/5 rounded-3xl p-6">
                <h3 className="text-lg font-bold text-white mb-6">Top Publishers by Volume</h3>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.topPublishers} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                            <Tooltip 
                                contentStyle={{backgroundColor: '#161624', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff'}}
                                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                {stats.topPublishers.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Quick Actions Sidebar (1/3 width) */}
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-3xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                    <button 
                        onClick={() => onNavigate(ViewMode.UPLOAD)}
                        className="w-full p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-between group"
                    >
                        <span>Ingest New List</span>
                        <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                    </button>
                    <button 
                        onClick={() => onNavigate(ViewMode.SCHOOLS)}
                        className="w-full p-4 bg-[#0c0c14] hover:bg-[#1f1f2e] border border-white/10 text-zinc-300 hover:text-white rounded-xl font-bold transition-all flex items-center justify-between group"
                    >
                        <span>Dispatch Status</span>
                        <i className="fa-solid fa-list-check group-hover:text-accent transition-colors"></i>
                    </button>
                    <button 
                        onClick={() => onNavigate(ViewMode.CONFIG)}
                        className="w-full p-4 bg-[#0c0c14] hover:bg-[#1f1f2e] border border-white/10 text-zinc-300 hover:text-white rounded-xl font-bold transition-all flex items-center justify-between group"
                    >
                        <span>System Configuration</span>
                        <i className="fa-solid fa-sliders group-hover:text-accent transition-colors"></i>
                    </button>
                </div>
            </div>

            <div className="bg-[#161624] border border-white/5 rounded-3xl p-6">
                 <h3 className="text-lg font-bold text-white mb-4">System Health</h3>
                 <div className="space-y-4">
                     <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-sm text-zinc-300">Database</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-400">ONLINE</span>
                     </div>
                     <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-sm text-zinc-300">Vortex AI</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-400">READY</span>
                     </div>
                 </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
