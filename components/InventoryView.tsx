import React, { useState, useMemo, useCallback } from 'react';
import { BookItem, School, NotificationType } from '../types';

interface InventoryViewProps {
  items: BookItem[];
  schools: School[];
  onDeleteItems: (ids: string[]) => void;
  onUpdateQuantity: (ids: string[], quantity: number) => void;
  onUpdateItemDetails: (id: string, updates: Partial<BookItem>) => void;
  notify: (type: NotificationType, message: string) => void;
}

enum GroupBy {
  PUBLISHER = 'Publisher',
  SCHOOL = 'School',
  SUBJECT = 'Subject'
}

type SortOption = 'title' | 'qty_desc' | 'qty_asc' | 'date';
type ViewType = 'list' | 'grid';

const getSubjectColor = (subject: string) => {
  const s = (subject || '').toLowerCase();
  if (s.includes('math')) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  if (s.includes('science')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  if (s.includes('english')) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  return 'text-zinc-400 bg-zinc-800 border-zinc-700';
};

interface InventoryItemProps {
    item: BookItem;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onEdit: (item: BookItem) => void;
}

const InventoryRow = React.memo<InventoryItemProps>(({ item, isSelected, onSelect, onEdit }) => (
    <tr
        className={`transition-colors cursor-pointer group hover:bg-white/[0.02] ${isSelected ? 'bg-indigo-500/10' : ''}`}
        onClick={() => onSelect(item.id)}
    >
        <td className="px-6 py-4">
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
            isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-zinc-700 text-transparent'
            }`}>
            <i className="fa-solid fa-check text-[10px]"></i>
            </div>
        </td>
        <td className="px-6 py-4 font-medium text-white">{item.title}</td>
        <td className="px-6 py-4 text-zinc-400">{item.grade}</td>
        <td className="px-6 py-4">
        <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wide border ${getSubjectColor(item.subject)}`}>
            {item.subject}
        </span>
        </td>
        <td className="px-6 py-4 text-zinc-400">{item.publisher}</td>
        <td className="px-6 py-4 text-right font-mono text-zinc-200">{item.quantity}</td>
        <td className="px-6 py-4 text-right">
            <button
            onClick={(e) => { e.stopPropagation(); onEdit(item); }}
            className="w-8 h-8 rounded hover:bg-white/10 text-zinc-500 hover:text-white transition-colors flex items-center justify-center"
            >
                <i className="fa-solid fa-pen text-xs"></i>
            </button>
        </td>
    </tr>
));

InventoryRow.displayName = 'InventoryRow';

const InventoryCard = React.memo<InventoryItemProps>(({ item, isSelected, onSelect, onEdit }) => (
    <div
        onClick={() => onSelect(item.id)}
        className={`bg-zinc-900/40 backdrop-blur-sm rounded-2xl p-5 border transition-all cursor-pointer relative group flex flex-col justify-between h-[220px] ${
        isSelected
        ? 'border-indigo-500 ring-1 ring-indigo-500/50 bg-indigo-500/5'
        : 'border-white/5 hover:border-zinc-700 hover:bg-zinc-900/80'
        }`}
    >
        <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
            onClick={(e) => { e.stopPropagation(); onEdit(item); }}
            className="w-5 h-5 rounded hover:bg-white/20 text-zinc-500 hover:text-white transition-colors flex items-center justify-center bg-black/20 backdrop-blur-md"
            >
                <i className="fa-solid fa-pen text-[10px]"></i>
            </button>
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-zinc-700 text-transparent bg-black/20'
            }`}>
                <i className="fa-solid fa-check text-xs"></i>
            </div>
        </div>

        <div>
            <span className={`inline-block px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wide border mb-3 ${getSubjectColor(item.subject)}`}>
            {item.subject}
            </span>
            <h4 className="font-bold text-white leading-tight line-clamp-3 mb-2 text-sm">
            {item.title}
            </h4>
            <p className="text-xs text-zinc-500">{item.publisher}</p>
        </div>

        <div className="flex items-end justify-between border-t border-white/5 pt-3 mt-2">
            <div>
                <p className="text-[10px] uppercase text-zinc-600 font-bold">Grade</p>
                <p className="text-xs font-bold text-zinc-300">{item.grade}</p>
            </div>
            <div className="text-right">
                <p className="text-[10px] uppercase text-zinc-600 font-bold">Qty</p>
                <p className="text-xl font-mono text-white leading-none">{item.quantity}</p>
            </div>
        </div>
    </div>
));

InventoryCard.displayName = 'InventoryCard';

const InventoryView: React.FC<InventoryViewProps> = ({ items, schools, onDeleteItems, onUpdateQuantity, onUpdateItemDetails, notify }) => {
  const [groupBy, setGroupBy] = useState<GroupBy>(GroupBy.PUBLISHER);
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('title');
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isEditingQty, setIsEditingQty] = useState(false);
  const [bulkQtyValue, setBulkQtyValue] = useState<string>('');

  // Editing State
  const [editingItem, setEditingItem] = useState<BookItem | null>(null);

  // Filtering State
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Derived Lists with null checks
  const allSubjects = useMemo(() => Array.from(new Set(items.map(i => i.subject || 'Uncategorized'))).sort(), [items]);
  const allSchoolOptions = useMemo(() => 
    schools
      .map(s => ({ id: s.id, name: s.name || 'Unknown School' }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || '')), 
    [schools]
  );

  const groupedData = useMemo<Record<string, BookItem[]>>(() => {
    // 1. Filter
    let filtered = items.filter(item => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        (item.title || '').toLowerCase().includes(term) || 
        (item.publisher || '').toLowerCase().includes(term) ||
        (item.grade || '').toLowerCase().includes(term);

      const matchesSubject = selectedSubjects.length === 0 || selectedSubjects.includes(item.subject || 'Uncategorized');
      const matchesSchool = selectedSchools.length === 0 || selectedSchools.includes(item.schoolId);

      return matchesSearch && matchesSubject && matchesSchool;
    });

    // 2. Sort
    filtered.sort((a, b) => {
        if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
        if (sortBy === 'qty_desc') return (b.quantity || 0) - (a.quantity || 0);
        if (sortBy === 'qty_asc') return (a.quantity || 0) - (b.quantity || 0);
        if (sortBy === 'date') return (new Date(b.createdAt || 0).getTime()) - (new Date(a.createdAt || 0).getTime());
        return 0;
    });

    // 3. Group
    const groups: Record<string, BookItem[]> = {};

    filtered.forEach(item => {
      let key = '';
      if (groupBy === GroupBy.PUBLISHER) key = item.publisher || 'Unknown Publisher';
      else if (groupBy === GroupBy.SUBJECT) key = item.subject || 'Uncategorized';
      else if (groupBy === GroupBy.SCHOOL) {
        const school = schools.find(s => s.id === item.schoolId);
        key = school ? (school.name || 'Unknown School') : 'Unknown School';
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    return groups;
  }, [items, schools, groupBy, searchTerm, selectedSubjects, selectedSchools, sortBy]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        return newSet;
    });
  }, []);

  const toggleSelectAll = () => {
    const allVisibleIds = (Object.values(groupedData).flat() as BookItem[]).map(i => i.id);
    if (selectedIds.size === allVisibleIds.length && allVisibleIds.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allVisibleIds));
    }
  };

  const toggleSelectGroup = (groupItems: BookItem[]) => {
    const newSet = new Set(selectedIds);
    const groupIds = groupItems.map(i => i.id);
    const allSelected = groupIds.every(id => newSet.has(id));

    if (allSelected) groupIds.forEach(id => newSet.delete(id));
    else groupIds.forEach(id => newSet.add(id));
    setSelectedIds(newSet);
  };

  const handleBulkDelete = () => {
    const count = selectedIds.size;
    onDeleteItems(Array.from(selectedIds));
    setSelectedIds(new Set());
    notify('success', `Deleted ${count} items.`);
  };

  const initiateBulkUpdate = () => {
    setIsEditingQty(true);
    setBulkQtyValue('');
  };

  const confirmBulkUpdate = () => {
    const qty = parseInt(bulkQtyValue, 10);
    if (!isNaN(qty) && qty >= 0) {
      onUpdateQuantity(Array.from(selectedIds), qty);
      setIsEditingQty(false);
      setSelectedIds(new Set());
      notify('success', 'Quantities updated.');
    } else {
        notify('error', 'Please enter a valid quantity.');
    }
  };

  const exportToCSV = () => {
      const allItems = Object.values(groupedData).flat() as BookItem[];
      if (allItems.length === 0) {
          notify('error', 'No data to export.');
          return;
      }

      const headers = ['Title', 'Publisher', 'Grade', 'Subject', 'Quantity', 'School'];
      const rows = allItems.map(item => {
          const school = schools.find(s => s.id === item.schoolId)?.name || 'Unknown';
          return [
              `"${(item.title || '').replace(/"/g, '""')}"`,
              `"${(item.publisher || '').replace(/"/g, '""')}"`,
              `"${(item.grade || '').replace(/"/g, '""')}"`,
              `"${(item.subject || '').replace(/"/g, '""')}"`,
              item.quantity || 0,
              `"${school.replace(/"/g, '""')}"`
          ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `inventory_export_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      notify('success', 'Export started.');
  };

  const handleEditSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingItem) return;
      
      onUpdateItemDetails(editingItem.id, {
          title: editingItem.title,
          publisher: editingItem.publisher,
          grade: editingItem.grade,
          subject: editingItem.subject,
          quantity: editingItem.quantity
      });
      setEditingItem(null);
      notify('success', 'Item details updated.');
  };

  const allVisibleCount = Object.values(groupedData).flat().length;

  return (
    <div className="p-8 lg:p-12 h-full flex flex-col min-h-screen">
      
      {/* Header & Controls */}
      <div className="flex flex-col gap-8 mb-10 border-b border-white/5 pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-bold text-white tracking-tight mb-2">Master Inventory</h2>
            <p className="text-zinc-400">{allVisibleCount} Items across {schools.length} schools</p>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
             <div className="relative group">
              <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors"></i>
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-full md:w-64 bg-zinc-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-zinc-600"
              />
            </div>
            
             <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-3 rounded-xl text-sm font-bold bg-zinc-900/50 border border-white/10 text-zinc-300 focus:outline-none focus:border-indigo-500/50"
             >
                 <option value="title">A-Z Title</option>
                 <option value="qty_desc">Qty: High to Low</option>
                 <option value="qty_asc">Qty: Low to High</option>
                 <option value="date">Newest First</option>
             </select>

            <button
                 onClick={() => setShowFilters(!showFilters)}
                 className={`px-4 py-3 rounded-xl text-sm font-bold transition-all border flex items-center justify-center gap-2 ${
                   showFilters || selectedSubjects.length > 0 || selectedSchools.length > 0
                   ? 'bg-white text-black border-white'
                   : 'bg-zinc-900/50 text-zinc-400 border-white/10 hover:text-white hover:border-white/20'
                 }`}
               >
                 <i className="fa-solid fa-filter"></i>
            </button>
             
             <button
                onClick={exportToCSV}
                className="px-4 py-3 rounded-xl text-sm font-bold bg-zinc-900/50 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2"
                title="Export CSV"
             >
                <i className="fa-solid fa-download"></i>
             </button>

             <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-1 flex">
                <button
                  onClick={() => setViewType('list')}
                  className={`w-10 flex items-center justify-center rounded-lg transition-all ${
                    viewType === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <i className="fa-solid fa-list"></i>
                </button>
                <button
                  onClick={() => setViewType('grid')}
                  className={`w-10 flex items-center justify-center rounded-lg transition-all ${
                    viewType === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <i className="fa-solid fa-grip"></i>
                </button>
              </div>
          </div>
        </div>
        
        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-[#0e0e11] p-6 rounded-2xl border border-white/5 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Subjects</h4>
                <div className="flex flex-wrap gap-2">
                  {allSubjects.map(subject => (
                    <button
                      key={subject}
                      onClick={() => {
                        setSelectedSubjects(prev => 
                          prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
                        );
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        selectedSubjects.includes(subject)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Schools</h4>
                <div className="flex flex-wrap gap-2">
                   {allSchoolOptions.map(school => (
                    <button
                      key={school.id}
                      onClick={() => {
                        setSelectedSchools(prev => 
                          prev.includes(school.id) ? prev.filter(s => s !== school.id) : [...prev, school.id]
                        );
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        selectedSchools.includes(school.id)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'
                      }`}
                    >
                      {school.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                  <button 
                    onClick={() => { setSelectedSubjects([]); setSelectedSchools([]); }}
                    className="text-xs font-bold text-zinc-500 hover:text-white transition-colors"
                  >
                    Reset Filters
                  </button>
            </div>
          </div>
        )}

        {/* Group By Tabs */}
        <div className="flex gap-4 items-center">
            <span className="text-sm text-zinc-500 font-medium">Group by:</span>
            <div className="flex gap-2">
                {Object.values(GroupBy).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setGroupBy(mode)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      groupBy === mode 
                        ? 'bg-white text-black border-white' 
                        : 'text-zinc-400 border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
            </div>
            <div className="flex-1"></div>
            <button
                onClick={toggleSelectAll}
                className={`text-xs font-bold transition-colors ${selectedIds.size > 0 ? 'text-indigo-400' : 'text-zinc-500 hover:text-white'}`}
            >
                {selectedIds.size > 0 && selectedIds.size === allVisibleCount ? 'Deselect All' : 'Select All'}
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto pb-32">
        {Object.keys(groupedData).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-600">
            <i className="fa-solid fa-ghost text-4xl mb-4 opacity-50"></i>
            <p>No inventory matches found.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedData).sort().map(([groupName, groupItems]) => (
              <div key={groupName} className="animate-fade-in">
                <div className="flex items-center gap-4 mb-4 group cursor-pointer select-none" onClick={() => toggleSelectGroup(groupItems)}>
                  <h3 className="font-bold text-xl text-white tracking-tight flex items-center gap-3">
                    {groupName}
                    <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md font-mono border border-white/5">
                        {groupItems.length}
                    </span>
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent"></div>
                </div>

                {viewType === 'list' ? (
                  <div className="bg-zinc-900/30 rounded-xl border border-white/5 overflow-hidden backdrop-blur-sm">
                    <table className="w-full text-left text-sm">
                      <thead className="text-xs text-zinc-500 uppercase bg-white/[0.02] border-b border-white/5 font-mono">
                        <tr>
                          <th className="w-12 px-6 py-4"></th>
                          <th className="px-6 py-4 font-normal">Title</th>
                          <th className="px-6 py-4 font-normal">Grade</th>
                          <th className="px-6 py-4 font-normal">Subject</th>
                          <th className="px-6 py-4 font-normal">Publisher</th>
                          <th className="px-6 py-4 font-normal text-right">Qty</th>
                          <th className="w-12 px-6 py-4"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {groupItems.map((item) => (
                            <InventoryRow
                                key={item.id}
                                item={item}
                                isSelected={selectedIds.has(item.id)}
                                onSelect={toggleSelection}
                                onEdit={setEditingItem}
                            />
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {groupItems.map((item) => (
                        <InventoryCard
                            key={item.id}
                            item={item}
                            isSelected={selectedIds.has(item.id)}
                            onSelect={toggleSelection}
                            onEdit={setEditingItem}
                        />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#18181b] border border-white/10 px-2 py-2 rounded-2xl shadow-2xl flex items-center gap-2 z-40 animate-slide-up w-auto max-w-lg">
           <div className="px-4 py-2 border-r border-white/10 flex items-center gap-3">
               <span className="bg-indigo-600 text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold">
                {selectedIds.size}
              </span>
              <span className="text-sm font-medium text-zinc-300">Selected</span>
           </div>
           
           {isEditingQty ? (
             <div className="flex items-center gap-2 px-2">
                <input 
                  type="number" 
                  autoFocus
                  placeholder="#"
                  className="w-20 bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  value={bulkQtyValue}
                  onChange={(e) => setBulkQtyValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && confirmBulkUpdate()}
                />
                <button onClick={confirmBulkUpdate} className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500">
                  <i className="fa-solid fa-check text-xs"></i>
                </button>
                <button onClick={() => setIsEditingQty(false)} className="w-9 h-9 rounded-lg bg-zinc-800 text-zinc-400 flex items-center justify-center hover:bg-zinc-700 hover:text-white">
                  <i className="fa-solid fa-xmark text-xs"></i>
                </button>
             </div>
           ) : (
             <div className="flex items-center gap-1 px-1">
                <button 
                  onClick={initiateBulkUpdate}
                  className="px-4 py-2 rounded-lg hover:bg-white/5 text-zinc-300 hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <i className="fa-solid fa-pen text-xs"></i> Edit Qty
                </button>
                <button 
                  onClick={handleBulkDelete}
                  className="px-4 py-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <i className="fa-solid fa-trash text-xs"></i> Delete
                </button>
             </div>
           )}

           <button 
              onClick={() => setSelectedIds(new Set())}
              className="w-9 h-9 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-white flex items-center justify-center ml-2"
            >
              <i className="fa-solid fa-xmark"></i>
           </button>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-[#09090b] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-slide-up">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white">Edit Item</h3>
                      <button onClick={() => setEditingItem(null)} className="text-zinc-500 hover:text-white"><i className="fa-solid fa-xmark"></i></button>
                  </div>
                  <form onSubmit={handleEditSave} className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Title</label>
                          <input 
                              type="text" 
                              value={editingItem.title} 
                              onChange={e => setEditingItem({...editingItem, title: e.target.value})}
                              className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
                              required
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Publisher</label>
                          <input 
                              type="text" 
                              value={editingItem.publisher} 
                              onChange={e => setEditingItem({...editingItem, publisher: e.target.value})}
                              className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
                              required
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Grade</label>
                            <input 
                                type="text" 
                                value={editingItem.grade} 
                                onChange={e => setEditingItem({...editingItem, grade: e.target.value})}
                                className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Subject</label>
                            <input 
                                type="text" 
                                value={editingItem.subject} 
                                onChange={e => setEditingItem({...editingItem, subject: e.target.value})}
                                className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
                            />
                          </div>
                      </div>
                       <div>
                          <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Quantity</label>
                          <input 
                              type="number" 
                              value={editingItem.quantity} 
                              onChange={e => setEditingItem({...editingItem, quantity: parseInt(e.target.value) || 0})}
                              className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
                              required
                          />
                      </div>
                      <div className="pt-4 flex gap-3">
                          <button type="button" onClick={() => setEditingItem(null)} className="flex-1 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-bold transition-colors">Cancel</button>
                          <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 font-bold transition-colors shadow-lg shadow-indigo-600/20">Save Changes</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default InventoryView;
