
import React, { useState, useRef } from 'react';
import { analyzeDocument } from '../services/geminiService';
import { BookItem, ProcessingStatus, NotificationType } from '../types';

interface DataIngestionProps {
    publishers: string[];
    onDataIngested: (schoolName: string, items: Omit<BookItem, 'id' | 'schoolId'>[]) => void;
    notify: (type: NotificationType, message: string) => void;
}

const DataIngestion: React.FC<DataIngestionProps> = ({ publishers, onDataIngested, notify }) => {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [status, setStatus] = useState<ProcessingStatus>({ isProcessing: false, message: '', progress: 0 });
    const inputRef = useRef<HTMLInputElement>(null);

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
            const droppedFiles = Array.from(e.dataTransfer.files);
            setFiles(prev => [...prev, ...droppedFiles]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const selectedFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...selectedFiles]);
        }
    };

    const removeFile = (idx: number) => {
        setFiles(prev => prev.filter((_, i) => i !== idx));
    };

    const clearFiles = () => setFiles([]);

    const loadSampleData = () => {
        // Hidden functionality to load mock files for demo
        const mockFile = new File(["dummy content"], "sample_booklist_v2.pdf", { type: "application/pdf" });
        setFiles(prev => [...prev, mockFile]);
        notify('info', 'Loaded sample file (mock mode).');
    };

    const processFiles = async () => {
        if (files.length === 0) return;
        setStatus({ isProcessing: true, message: 'Initializing AI Engine...', progress: 10 });

        try {
            let successCount = 0;
            const total = files.length;

            for (let i = 0; i < total; i++) {
                const file = files[i];
                setStatus({ isProcessing: true, message: `Analyzing ${file.name}...`, progress: 10 + Math.round(((i + 1) / total) * 80) });

                // --- MOCK MODE ONLY FOR DEMO FILES ---
                let schoolName = "Unknown School";
                let items: any[] = [];

                if (file.name.includes('sample') || file.name.includes('mock')) {
                    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
                    schoolName = "St. Xavier's High School";
                    items = [
                        { title: "Mathematics Today", publisher: "Pearson", originalPublisherString: "Pearson Education", grade: "5", quantity: 120, subject: "Math" },
                        { title: "Science Explorer", publisher: "Macmillan", originalPublisherString: "Macmillan", grade: "5", quantity: 120, subject: "Science" },
                        { title: "Junior English", publisher: "Orient Blackswan", originalPublisherString: "Blackswan", grade: "4", quantity: 85, subject: "English" }
                    ];
                } else {
                    // Real AI processing via Backend
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

                onDataIngested(schoolName, items);
                successCount++;
            }

            setStatus({ isProcessing: false, message: 'Ingestion Complete', progress: 100 });
            setFiles([]);
            notify('success', `Successfully processed ${successCount} documents!`);

            setTimeout(() => setStatus({ isProcessing: false, message: '', progress: 0 }), 3000);

        } catch (error) {
            console.error(error);
            setStatus({ isProcessing: false, message: 'Processing Error', progress: 0, error: String(error) });
            notify('error', 'AI Processing Failed. Please ensuring backend is running and file is valid.');
        }
    };

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
                        {files.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white/[0.02] p-4 rounded-xl border border-white/5 group hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-500">
                                        <i className={`fa-regular ${file.type.includes('image') ? 'fa-file-image' : 'fa-file-pdf'}`}></i>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium truncate max-w-md text-sm">{file.name}</p>
                                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-bold">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
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
                                    <span>{status.progress}%</span>
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
