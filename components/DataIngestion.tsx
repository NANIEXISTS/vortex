import React, { useState, useRef, useEffect } from 'react';
import { analyzeDocument } from '../services/geminiService';
import { BookItem, ProcessingStatus, NotificationType } from '../types';

interface FileWithId {
    id: string;
    file: File;
}

interface AnalyzedBatch {
    id: string;
    fileName: string;
    schoolName: string;
    items: any[];
}

interface DataIngestionProps {
    publishers: string[];
    onDataIngested: (schoolName: string, items: Omit<BookItem, 'id' | 'schoolId'>[]) => Promise<void> | void;
    notify: (type: NotificationType, message: string) => void;
}

const DataIngestion: React.FC<DataIngestionProps> = ({ publishers, onDataIngested, notify }) => {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState<FileWithId[]>([]);
    const [status, setStatus] = useState<ProcessingStatus>({ isProcessing: false, message: '', progress: 0 });
    const inputRef = useRef<HTMLInputElement>(null);

    // Review Mode State
    const [isReviewing, setIsReviewing] = useState(false);
    const [analyzedBatches, setAnalyzedBatches] = useState<AnalyzedBatch[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFiles = Array.from(e.dataTransfer.files).map(file => ({
                id: crypto.randomUUID(),
                file
            }));
            setFiles(prev => [...prev, ...droppedFiles]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const selectedFiles = Array.from(e.target.files).map(file => ({
                id: crypto.randomUUID(),
                file
            }));
            setFiles(prev => [...prev, ...selectedFiles]);
        }
    };

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const clearFiles = () => setFiles([]);

    const loadSampleData = () => {
        const mockFile = new File(["dummy content"], "sample_booklist_v2.pdf", { type: "application/pdf" });
        setFiles(prev => [...prev, { id: crypto.randomUUID(), file: mockFile }]);
        notify('info', 'Loaded sample file (mock mode).');
    };

    const processFiles = async () => {
        if (files.length === 0) return;
        setStatus({ isProcessing: true, message: 'Initializing AI Engine...', progress: 10 });

        const results: AnalyzedBatch[] = [];

        try {
            const total = files.length;

            for (let i = 0; i < total; i++) {
                const { file, id } = files[i];
                setStatus({ isProcessing: true, message: `Analyzing ${file.name}...`, progress: 10 + Math.round(((i) / total) * 80) });

                // Fake progress interval during await
                const interval = setInterval(() => {
                    setStatus(prev => ({
                        ...prev,
                        progress: Math.min(prev.progress + 2, 90) // Cap at 90% until done
                    }));
                }, 500);

                let schoolName = "Unknown School";
                let items: any[] = [];

                try {
                    if (file.name.includes('sample') || file.name.includes('mock')) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        schoolName = "St. Xavier's High School";
                        items = [
                            { title: "Mathematics Today", publisher: "Pearson", originalPublisherString: "Pearson Education", grade: "5", quantity: 120, subject: "Math" },
                            { title: "Science Explorer", publisher: "Macmillan", originalPublisherString: "Macmillan", grade: "5", quantity: 120, subject: "Science" },
                            { title: "Junior English", publisher: "Orient Blackswan", originalPublisherString: "Blackswan", grade: "4", quantity: 85, subject: "English" }
                        ];
                    } else {
                        const result = await analyzeDocument(file);
                        schoolName = result.schoolName;
                        items = result.items.map((item: any) => ({
                            title: item.title,
                            publisher: item.publisher,
                            originalPublisherString: item.publisher,
                            grade: item.grade,
                            quantity: item.quantity,
                            subject: item.subject
                        }));
                    }
                    results.push({ id, fileName: file.name, schoolName, items });
                } finally {
                    clearInterval(interval);
                }
            }

            setStatus({ isProcessing: false, message: 'Analysis Complete', progress: 100 });
            setAnalyzedBatches(results);
            setIsReviewing(true);

        } catch (error) {
            console.error(error);
            setStatus({ isProcessing: false, message: 'Processing Error', progress: 0, error: String(error) });
            notify('error', 'AI Processing Failed. Please ensure backend is running and file is valid.');
        }
    };

    const handleConfirmImport = async () => {
        setIsSaving(true);
        try {
            for (const batch of analyzedBatches) {
                await onDataIngested(batch.schoolName, batch.items);
            }
            notify('success', `Successfully imported ${analyzedBatches.length} documents!`);

            // Reset
            setIsReviewing(false);
            setAnalyzedBatches([]);
            setFiles([]);
            setStatus({ isProcessing: false, message: '', progress: 0 });

        } catch (e) {
            notify('error', 'Failed to save data.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelReview = () => {
        setIsReviewing(false);
        setAnalyzedBatches([]);
        setStatus({ isProcessing: false, message: '', progress: 0 });
    };

    // --- RENDER: REVIEW SCREEN ---
    if (isReviewing) {
        return (
            <div className="p-8 lg:p-12 max-w-6xl mx-auto min-h-screen animate-fade-in pb-32">
                 <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-white mb-4">Review Extracted Data</h2>
                    <p className="text-zinc-400 text-lg">Please verify the information before importing.</p>
                </div>

                <div className="space-y-8">
                    {analyzedBatches.map((batch) => (
                        <div key={batch.id} className="glass-panel p-6 rounded-3xl border border-white/10">
                            <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xl">
                                    <i className="fa-solid fa-school"></i>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{batch.schoolName}</h3>
                                    <p className="text-sm text-zinc-500 flex items-center gap-2">
                                        <i className="fa-solid fa-file"></i> {batch.fileName}
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-white/10 text-xs font-bold text-zinc-500 uppercase">
                                            <th className="pb-3 pl-2">Title</th>
                                            <th className="pb-3">Publisher</th>
                                            <th className="pb-3 text-center">Qty</th>
                                            <th className="pb-3">Subject</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {batch.items.map((item: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                <td className="py-3 pl-2 font-medium text-white">{item.title}</td>
                                                <td className="py-3 text-zinc-300">
                                                    {item.publisher}
                                                    {item.publisher !== item.originalPublisherString && (
                                                        <span className="ml-2 text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-zinc-500 line-through opacity-70">
                                                            {item.originalPublisherString}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 text-center font-bold text-emerald-400">{item.quantity}</td>
                                                <td className="py-3 text-zinc-400">{item.subject}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#050508]/90 backdrop-blur-xl border-t border-white/10 z-50 md:ml-64 flex justify-end gap-4">
                    <button
                        onClick={handleCancelReview}
                        disabled={isSaving}
                        className="px-6 py-3 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmImport}
                        disabled={isSaving}
                        className="px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2"
                    >
                        {isSaving ? (
                            <><i className="fa-solid fa-circle-notch fa-spin"></i> Importing...</>
                        ) : (
                            <><i className="fa-solid fa-check"></i> Confirm & Import</>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    // --- RENDER: UPLOAD SCREEN ---
    return (
        <div className="p-8 lg:p-12 max-w-5xl mx-auto min-h-screen flex flex-col justify-center animate-slide-up">
            <div className="text-center mb-12">
                <h2 className="text-5xl font-extrabold text-white mb-4">Import Data</h2>
                <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
                    Upload school book lists. <br />
                    Vortex will map items to your <strong>{publishers.length} configured publishers</strong>.
                </p>
            </div>

            <div
                className={`relative border-2 border-dashed rounded-[2rem] p-16 text-center transition-all duration-300 group cursor-pointer overflow-hidden ${dragActive
                        ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]'
                        : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleChange}
                />

                {/* Glow Effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10 flex flex-col items-center gap-6 pointer-events-none">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-xl transition-transform duration-300 ${dragActive ? 'bg-indigo-500 text-white scale-110' : 'bg-zinc-800 text-zinc-400 border border-white/5'}`}>
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-white mb-2">Drop files here</p>
                        <p className="text-zinc-500 font-medium">or click to browse</p>
                    </div>
                </div>
            </div>

            {/* Helper Actions */}
            <div className="flex justify-center mt-6">
                <button
                    onClick={loadSampleData}
                    className="text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
                >
                    <i className="fa-solid fa-flask"></i> Try with Sample Bulk Data
                </button>
            </div>

            {files.length > 0 && (
                <div className="mt-12 bg-[#0e0e11] border border-white/5 rounded-3xl p-6 animate-slide-up">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                <span className="font-bold text-sm">{files.length}</span>
                            </div>
                            <h3 className="font-bold text-white text-lg">Ready to Process</h3>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={clearFiles}
                                disabled={status.isProcessing}
                                className="text-zinc-500 px-4 py-3 font-bold hover:text-white transition-colors disabled:opacity-50 text-sm"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={processFiles}
                                disabled={status.isProcessing}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-indigo-600/20 text-sm"
                            >
                                {status.isProcessing ? (
                                    <span className="flex items-center gap-2"><i className="fa-solid fa-circle-notch fa-spin"></i> Processing...</span>
                                ) : (
                                    <span className="flex items-center gap-2">Start Analysis <i className="fa-solid fa-arrow-right"></i></span>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {files.map((fileWrapper) => (
                            <div key={fileWrapper.id} className="flex items-center justify-between bg-white/[0.02] p-4 rounded-xl border border-white/5 group hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-500">
                                        <i className={`fa-regular ${fileWrapper.file.type.includes('image') ? 'fa-file-image' : 'fa-file-pdf'}`}></i>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium truncate max-w-md text-sm">{fileWrapper.file.name}</p>
                                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-bold">{(fileWrapper.file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeFile(fileWrapper.id); }}
                                    className="w-8 h-8 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-500 transition-colors flex items-center justify-center"
                                >
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                        ))}
                    </div>

                    {status.isProcessing && (
                        <div className="mt-8 bg-zinc-900/50 border border-white/5 p-6 rounded-2xl animate-fade-in relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-50"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between text-sm mb-3 text-indigo-300 font-mono">
                                    <span className="flex items-center gap-2">
                                        <i className="fa-solid fa-microchip"></i> {status.message}
                                    </span>
                                    <span>{Math.round(status.progress)}%</span>
                                </div>
                                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-indigo-500 h-full transition-all duration-300 ease-out shadow-[0_0_10px_#6366f1]"
                                        style={{ width: `${status.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DataIngestion;
