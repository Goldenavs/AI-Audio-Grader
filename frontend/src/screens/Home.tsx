// src/screens/Home.tsx
import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InteractiveBackground from '../components/InteractiveBackground';
import GlowingCard from '../components/GlowingCard';

// Updated Interface to match the Python analysis.py output
interface BatchResults {
  totalRows: number;
  pearsonR: number;
  pearsonP: number;
  spearmanR: number;
  spearmanP: number;
  meanAbsDiff: number;
  plotImageUrl: string; // <-- Add this
}

// Custom Icons
const FolderIcon = () => (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>);
const FileAudioIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>);
const CsvIcon = () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>);
const PowerIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>);

export default function Home() {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [results, setResults] = useState<BatchResults | null>(null);

  // Audio Folder State
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [isDraggingMedia, setIsDraggingMedia] = useState<boolean>(false);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Human Scores CSV State
  const [humanScoresFile, setHumanScoresFile] = useState<File | null>(null);
  const [isDraggingCsv, setIsDraggingCsv] = useState<boolean>(false);
  const csvInputRef = useRef<HTMLInputElement>(null);

  // Handlers for Folder Upload
  const handleFolderSelection = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    const audioOnly = fileArray.filter(f => f.type.startsWith('audio/') || f.name.match(/\.(mp3|wav|m4a|aac|flac|ogg)$/i));
    
    if (audioOnly.length > 0) {
      setAudioFiles(audioOnly);
    } else {
      alert("No valid audio files found in the selected folder.");
    }
  };

  const handleFolderChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFolderSelection(e.target.files);
  };

  // Handlers for CSV Upload
  const handleCsvFile = (file: File) => {
    if (file.name.endsWith('.csv')) {
      setHumanScoresFile(file);
    } else {
      alert("Please upload a valid CSV file (e.g., human_scores.csv).");
    }
  };

  const handleCsvChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) handleCsvFile(e.target.files[0]);
  };

  const preventDefaults = (e: DragEvent<HTMLDivElement>) => e.preventDefault();
  
  // Simulated Pipeline Execution
// Real Pipeline Execution
  const startAnalysis = async () => {
    if (audioFiles.length === 0 || !humanScoresFile) return;
    setIsProcessing(true);
    
    const formData = new FormData();
    
    // Append the CSV
    formData.append("human_scores", humanScoresFile);
    
    // Append all audio files
    audioFiles.forEach((file) => {
      formData.append("audio_files", file, file.name);
    });

    try {
      const response = await fetch("http://localhost:8000/api/batch-analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Backend processing failed");
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error(error);
      alert("Error connecting to the backend. Is the FastAPI server running?");
    } finally {
      setIsProcessing(false);
    }
  };

  const isFormReady = audioFiles.length > 0 && humanScoresFile && !isProcessing;
  const springTransition = { type: "spring" as const, stiffness: 300, damping: 24 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      <InteractiveBackground />
      
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
        style={{ padding: '80px 20px', maxWidth: '1100px', margin: '0 auto', width: '100%', boxSizing: 'border-box', zIndex: 1 }}
      >
        <motion.header 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ...springTransition }}
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <div style={{ display: 'inline-block', padding: '6px 16px', backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '20px', color: '#38bdf8', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '2px', marginBottom: '20px', textTransform: 'uppercase' }}>
            Batch Processing Pipeline
          </div>
          <h1 style={{ fontSize: '4rem', fontWeight: '800', margin: '0 0 15px 0', background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-2px' }}>
            Data Analytics<span style={{ color: '#38bdf8' }}>.</span>
          </h1>
        </motion.header>

        <div style={{ display: 'flex', gap: '30px', marginBottom: '40px', flexWrap: 'wrap', alignItems: 'stretch' }}>
          
          {/* --- LEFT COLUMN: FOLDER INPUT --- */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ...springTransition }}
            style={{ flex: '1 1 450px' }}
          >
            <GlowingCard accentColor="blue" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#38bdf8', boxShadow: '0 0 15px #38bdf8' }} />
                <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.3rem', fontWeight: '600' }}>Audio Dataset (Folder)</h3>
              </div>
              
              <motion.div 
                onDragOver={(e) => { preventDefaults(e); setIsDraggingMedia(true); }}
                onDragLeave={(e) => { preventDefaults(e); setIsDraggingMedia(false); }}
                onDrop={(e) => { preventDefaults(e); setIsDraggingMedia(false); if (e.dataTransfer.files.length > 0) handleFolderSelection(e.dataTransfer.files); }}
                onClick={() => folderInputRef.current?.click()}
                whileHover={{ scale: 1.01, backgroundColor: 'rgba(56, 189, 248, 0.08)' }}
                style={{ flex: 1, padding: '40px 20px', border: `2px dashed ${isDraggingMedia || audioFiles.length > 0 ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`, borderRadius: '16px', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', minHeight: '220px', backgroundColor: 'rgba(0,0,0,0.3)' }}
              >
                {/* Notice the webkitdirectory flag here */}
                <input type="file" ref={folderInputRef} onChange={handleFolderChange} style={{ display: 'none' }} {...{ webkitdirectory: "true", directory: "true" }} multiple />
                
                {audioFiles.length > 0 ? (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <FileAudioIcon />
                    <h2 style={{ color: '#f8fafc', fontWeight: '700', fontSize: '2.5rem', margin: '15px 0 5px 0' }}>{audioFiles.length}</h2>
                    <p style={{ color: '#38bdf8', fontWeight: '600', margin: 0 }}>Audio Files Queued</p>
                    <button onClick={(e) => { e.stopPropagation(); setAudioFiles([]); }} style={{ marginTop: '20px', padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>Clear Dataset</button>
                  </motion.div>
                ) : (
                  <>
                    <FolderIcon />
                    <p style={{ color: '#e2e8f0', fontWeight: '500', marginTop: '15px' }}>{isDraggingMedia ? 'Drop audio folder here' : 'Click to select Audio Folder'}</p>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '5px 0 0 0' }}>Recursively loads .wav, .mp3, etc.</p>
                  </>
                )}
              </motion.div>
            </GlowingCard>
          </motion.div>

          {/* --- RIGHT COLUMN: CSV UPLOAD --- */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, ...springTransition }}
            style={{ flex: '1 1 450px' }}
          >
            <GlowingCard accentColor="orange" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#fb923c', boxShadow: '0 0 15px #fb923c' }} />
                <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.3rem', fontWeight: '600' }}>Human Assessment Data</h3>
              </div>
              
              <motion.div 
                onDragOver={(e) => { preventDefaults(e); setIsDraggingCsv(true); }}
                onDragLeave={(e) => { preventDefaults(e); setIsDraggingCsv(false); }}
                onDrop={(e) => { preventDefaults(e); setIsDraggingCsv(false); if (e.dataTransfer.files.length > 0) handleCsvFile(e.dataTransfer.files[0]); }}
                onClick={() => csvInputRef.current?.click()}
                whileHover={{ scale: 1.01, backgroundColor: 'rgba(251, 146, 60, 0.08)' }}
                style={{ flex: 1, padding: '40px 20px', border: `2px dashed ${isDraggingCsv || humanScoresFile ? '#fb923c' : 'rgba(255,255,255,0.1)'}`, borderRadius: '16px', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', minHeight: '220px', backgroundColor: 'rgba(0,0,0,0.3)' }}
              >
                <input type="file" accept=".csv" ref={csvInputRef} onChange={handleCsvChange} style={{ display: 'none' }} />
                {humanScoresFile ? (
                   <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                     <CsvIcon />
                     <p style={{ color: '#f8fafc', fontWeight: '600', marginTop: '15px' }}>{humanScoresFile.name}</p>
                     <p style={{ color: '#fb923c', fontSize: '0.85rem', margin: '5px 0 0 0' }}>Ready for merge operation</p>
                     <button onClick={(e) => { e.stopPropagation(); setHumanScoresFile(null); }} style={{ marginTop: '20px', padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>Remove CSV</button>
                   </motion.div>
                ) : (
                  <>
                    <CsvIcon />
                    <p style={{ color: '#e2e8f0', fontWeight: '500', marginTop: '15px' }}>Drop human_scores.csv here</p>
                  </>
                )}
              </motion.div>
            </GlowingCard>
          </motion.div>
        </div>

        {/* --- PROCESS BUTTON --- */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, ...springTransition }}>
          <motion.button 
            whileHover={{ scale: !isFormReady ? 1 : 1.01 }} whileTap={{ scale: !isFormReady ? 1 : 0.98 }}
            onClick={startAnalysis} disabled={!isFormReady}
            style={{ width: '100%', padding: '24px', fontSize: '1.2rem', fontWeight: '700', letterSpacing: '2px', background: !isFormReady ? 'rgba(30, 41, 59, 0.5)' : 'linear-gradient(90deg, #0284c7, #ea580c)', color: !isFormReady ? '#64748b' : 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', cursor: !isFormReady ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', textTransform: 'uppercase' }}
          >
            {isProcessing ? 'Executing Batch Pipeline...' : 'Run Batch Analysis'}
          </motion.button>
        </motion.div>
        
        {/* --- STATISTICAL DASHBOARD (RESULTS) --- */}
        <AnimatePresence>
          {results && (
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }} transition={{ duration: 0.5, type: "spring", bounce: 0.3 }} style={{ marginTop: '60px' }}>
              <div style={{ padding: '50px', borderRadius: '30px', position: 'relative', overflow: 'hidden', backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #38bdf8, #fb923c, #38bdf8)', backgroundSize: '200% auto', animation: 'gradientFlow 3s linear infinite' }} />
                
                <motion.button
                  onClick={() => setResults(null)}
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)', boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)' }}
                  whileTap={{ scale: 0.95 }}
                  style={{ position: 'absolute', top: '25px', right: '25px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.3s ease', textTransform: 'uppercase', zIndex: 10 }}
                >
                  <PowerIcon /> Clear Session
                </motion.button>

                <div style={{ textAlign: 'center', marginBottom: '50px', marginTop: '20px' }}>
                  <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px' }}>Regression Analysis</h2>
                  <p style={{ color: '#94a3b8', marginTop: '10px', fontSize: '1.1rem' }}>Final Dataset Matched Rows: <span style={{ color: '#38bdf8', fontWeight: '700' }}>{results.totalRows}</span></p>
                </div>
                
                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                  
                  {/* Pearson Stat */}
                  <div style={{ padding: '30px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                    <p style={{ margin: 0, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>Pearson (r)</p>
                    <h1 style={{ margin: '15px 0', fontSize: '3.5rem', color: '#38bdf8', fontWeight: '800' }}>{results.pearsonR}</h1>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>p = {results.pearsonP}</p>
                  </div>

                  {/* Spearman Stat */}
                  <div style={{ padding: '30px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                    <p style={{ margin: 0, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>Spearman (ρ)</p>
                    <h1 style={{ margin: '15px 0', fontSize: '3.5rem', color: '#fb923c', fontWeight: '800' }}>{results.spearmanR}</h1>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>p = {results.spearmanP}</p>
                  </div>

                  {/* MAD Stat */}
                  <div style={{ padding: '30px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                    <p style={{ margin: 0, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>Mean Abs Difference</p>
                    <h1 style={{ margin: '15px 0', fontSize: '3.5rem', color: '#10b981', fontWeight: '800' }}>{results.meanAbsDiff}</h1>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>Points deviation</p>
                  </div>

                </div>

                {/* Graph Render (Figure2_Scatter.png) */}
                <div style={{ height: '350px', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', overflow: 'hidden' }}>
                  {results.plotImageUrl ? (
                    <img src={results.plotImageUrl} alt="Regression Scatter Plot" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>
                      <p style={{ color: '#64748b', marginTop: '15px', fontWeight: '500' }}>Awaiting Figure2_Scatter.png from Backend</p>
                    </>
                  )}
                </div>
                
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}