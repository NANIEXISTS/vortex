
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
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    notify('info', `${newFiles.length} file(s) added to queue.`);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setFiles([]);
    setStatus({ isProcessing: false, message: '', progress: 0 });
    notify('info', 'Queue cleared.');
  };

  const loadSampleData = () => {
    // Create dummy files to simulate a bulk upload scenario
    const sample1 = new File(["(mock content 1)"], "Willow_Creek_High_Order.pdf", { type: "application/pdf" });
    const sample2 = new File(["(mock content 2)"], "St_Marys_Primary_List.img", { type: "image/png" });
    handleFiles([sample1, sample2]);
    notify('success', 'Loaded 2 sample manifests for testing.');
  };

  const processFiles = async () => {
    if (files.length === 0) return;

    setStatus({ isProcessing: true, message: 'Initializing AI Engine...', progress: 5 });

    try {
      let successCount = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setStatus({ 
          isProcessing: true, 
          message: `Analyzing ${file.name}...`, 
          progress: 10 + Math.floor(((i + 1) / files.length) * 85) 
        });

        let items, schoolName;

        // Bypass AI for sample files to allow instant demo
        if (file.name === "Willow_Creek_High_Order.pdf" || file.name === "St_Marys_Primary_List.img") {
             await new Promise(r => setTimeout(r, 1500)); // Simulate processing time
             
             if (file.name.includes("Willow")) {
                 schoolName = "Willow Creek High";
                 items = [
                     { title: "Advanced Physics 1", publisher: "Oxford University Press", originalPublisherString: "Oxford", grade: "11", quantity: 45, subject: "Physics" },
                     { title: "Chemistry Today", publisher: "Pearson Education", originalPublisherString: "Pearson", grade: "11", quantity: 40, subject: "Chemistry" },
                     { title: "World History", publisher: "Cambridge University Press", originalPublisherString: "Cambridge", grade: "9", quantity: 120, subject: "History" }
                 ];
             } else {
                 schoolName = "St. Mary's Primary";
                 items = [
                     { title: "Math Magic 4", publisher: "S. Chand Publishing", originalPublisherString: "S Chand", grade: "4", quantity: 80, subject: "Math" },
                     { title: "Junior English", publisher: "Orient Blackswan", originalPublisherString: "Blackswan", grade: "4", quantity: 85, subject: "English" }
                 ];
             }
        } else {
            // Real AI processing
            const result = await analyzeDocument(file, publishers);
            schoolName = result.schoolName;
            items = result.items.map(item => ({
              title: item.title,
              publisher: item.publisher, 
              originalPublisherString: item.publisher, // Keep original in case mapping was "Other"
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
      notify('error', 'AI Processing Failed. Please check the document format.');
    }
  };

  return (
    <div className="p-8 lg:p-12 max-w-5xl mx-auto min-h-screen flex flex-col justify-center animate-slide-up">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-extrabold text-white mb-4">Import Data</h2>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Upload school book lists. <br/>
          Vortex will map items to your <strong>{publishers.length} configured publishers</strong>.
        </p>
      </div>

      <div 
        className={`relative border-2 border-dashed rounded-[2rem] p-16 text-center transition-all duration-300 group cursor-pointer overflow-hidden ${
          dragActive 
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
                  onClick={(e) => {e.stopPropagation(); removeFile(idx);}}
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
