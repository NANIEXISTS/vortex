
import React, { useState, useMemo } from 'react';
import { School, BookItem, NotificationType } from '../types';

interface SchoolDispatchProps {
  schools: School[];
  items: BookItem[];
  notify: (type: NotificationType, message: string) => void;
}

const SchoolDispatch: React.FC<SchoolDispatchProps> = ({ schools, items, notify }) => {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // -- Detail View Logic --
  const selectedSchool = useMemo(() => 
    schools.find(s => s.id === selectedSchoolId), 
  [schools, selectedSchoolId]);

  const schoolItems = useMemo(() => 
    items.filter(i => i.schoolId === selectedSchoolId),
  [items, selectedSchoolId]);

  const schoolStats = useMemo(() => {
     const totalQty = schoolItems.reduce((acc, i) => acc + i.quantity, 0);
     const subjects = new Set(schoolItems.map(i => i.subject)).size;
     return { totalQty, subjects };
  }, [schoolItems]);

  const groupedItems = useMemo<Record<string, BookItem[]>>(() => {
      const groups: Record<string, BookItem[]> = {};
      schoolItems.forEach(item => {
          const key = item.subject || 'Uncategorized';
          if (!groups[key]) groups[key] = [];
          groups[key].push(item);
      });
      return groups;
  }, [schoolItems]);

  const handlePrint = () => {
    window.print();
    notify('success', 'Printing dispatch sheet...');
  };

  // -- List View Logic --
  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSchoolItemCount = (id: string) => items.filter(i => i.schoolId === id).reduce((acc, i) => acc + i.quantity, 0);

  // -- RENDER: Detail View --
  if (selectedSchoolId && selectedSchool) {
    return (
        <div className="p-8 lg:p-12 min-h-screen animate-slide-up">
            <button 
                onClick={() => setSelectedSchoolId(null)}
                className="mb-8 text-secondary hover:text-white flex items-center gap-2 transition-colors no-print"
            >
                <i className="fa-solid fa-arrow-left"></i> Back to Schools
            </button>

            <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-surfaceHighlight p-8 border-b border-border flex flex-col md:flex-row justify-between md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white mb-2">{selectedSchool.name}</h1>
                        <div className="flex gap-4 text-sm text-secondary">
                             <span className="flex items-center gap-2"><i className="fa-solid fa-box"></i> {schoolStats.totalQty} Items</span>
                             <span className="flex items-center gap-2"><i className="fa-solid fa-layer-group"></i> {schoolStats.subjects} Subjects</span>
                        </div>
                    </div>
                    <button 
                        onClick={handlePrint}
                        className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2 no-print"
                    >
                        <i className="fa-solid fa-print"></i> Print Dispatch Sheet
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {Object.keys(groupedItems).length === 0 ? (
                        <div className="text-center py-20 text-zinc-500">
                            <i className="fa-solid fa-clipboard-list text-4xl mb-4 opacity-50"></i>
                            <p>No requirements list found for this school.</p>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {Object.entries(groupedItems).sort().map(([subject, items]) => (
                                <div key={subject} className="break-inside-avoid">
                                    <h3 className="text-lg font-bold text-accent uppercase tracking-widest mb-4 border-b border-white/10 pb-2 flex justify-between items-end">
                                        {subject}
                                        <span className="text-xs text-zinc-500 font-mono normal-case">
                                            {items.reduce((acc, i) => acc + i.quantity, 0)} units
                                        </span>
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="text-xs text-zinc-500 font-bold uppercase bg-white/[0.02]">
                                                <tr>
                                                    <th className="px-4 py-3 rounded-l-lg">Title</th>
                                                    <th className="px-4 py-3">Publisher</th>
                                                    <th className="px-4 py-3">Grade</th>
                                                    <th className="px-4 py-3 text-right rounded-r-lg">Qty</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {items.map(item => (
                                                    <tr key={item.id} className="hover:bg-white/[0.01]">
                                                        <td className="px-4 py-3 font-medium text-white">{item.title}</td>
                                                        <td className="px-4 py-3 text-zinc-400">{item.publisher}</td>
                                                        <td className="px-4 py-3 text-zinc-400">{item.grade}</td>
                                                        <td className="px-4 py-3 text-right font-mono font-bold text-white">{item.quantity}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
  }

  // -- RENDER: List View --
  return (
    <div className="p-8 lg:p-12 min-h-screen">
       <header className="mb-10">
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">School Network</h1>
            <p className="text-secondary">Select a school to view dispatch requirements and book lists.</p>
       </header>

       <div className="mb-8 relative max-w-md">
            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"></i>
            <input 
                type="text" 
                placeholder="Find school..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl pl-12 pr-4 py-3 text-white focus:border-accent outline-none"
            />
       </div>

       {filteredSchools.length === 0 ? (
           <div className="text-center py-20 text-zinc-500">
               <p>No schools found.</p>
           </div>
       ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {filteredSchools.map(school => {
                   const count = getSchoolItemCount(school.id);
                   return (
                       <button 
                            key={school.id}
                            onClick={() => setSelectedSchoolId(school.id)}
                            className="bg-surface border border-border p-6 rounded-2xl hover:border-accent/50 hover:bg-surfaceHighlight transition-all group text-left relative overflow-hidden"
                       >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <i className="fa-solid fa-school text-6xl text-accent transform -rotate-12 translate-x-2 -translate-y-2"></i>
                            </div>
                            
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent transition-colors">{school.name}</h3>
                                <div className="flex items-center gap-4 mt-4">
                                    <div className="px-3 py-1 rounded-lg bg-black/30 border border-white/5">
                                        <span className="text-xs text-zinc-400 uppercase font-bold block">Requirement</span>
                                        <span className="text-lg font-mono text-white leading-none">{count} <span className="text-xs font-sans font-normal text-zinc-500">items</span></span>
                                    </div>
                                    <div className="w-px h-8 bg-white/10"></div>
                                    <div className="text-sm text-zinc-400 flex items-center gap-2">
                                        Status: <span className="text-emerald-400 font-bold">Active</span>
                                    </div>
                                </div>
                            </div>
                       </button>
                   );
               })}
           </div>
       )}
    </div>
  );
};

export default SchoolDispatch;
