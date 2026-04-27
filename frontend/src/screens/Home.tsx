import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GradingResults {
  humanScore: number;
  aiScore: number;
  transcriptionSnippet: string;
  variance: number;
}

// --- Custom UI Icons ---
const UploadIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);
const MicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line>
  </svg>
);
const FileAudioIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>
  </svg>
);
const FileDocumentIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

// --- Animated Ambient Background ---
const AmbientBackground = () => (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1, overflow: 'hidden', backgroundColor: '#050505' }}>
    {/* Blue Orb */}
    <motion.div 
      animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15], x: [0, 50, 0], y: [0, -30, 0] }} 
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} 
      style={{ position: 'absolute', top: '-20%', left: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.4) 0%, transparent 70%)', filter: 'blur(80px)' }} 
    />
    {/* Orange Orb */}
    <motion.div 
      animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1], x: [0, -60, 0], y: [0, 40, 0] }} 
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} 
      style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,146,60,0.3) 0%, transparent 70%)', filter: 'blur(80px)' }} 
    />
  </div>
);

export default function Home() {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [results, setResults] = useState<GradingResults | null>(null);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isDraggingMedia, setIsDraggingMedia] = useState<boolean>(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const [baselineFile, setBaselineFile] = useState<File | null>(null);
  const [humanScore, setHumanScore] = useState<string>('');
  const [isDraggingBaseline, setIsDraggingBaseline] = useState<boolean>(false);
  const baselineInputRef = useRef<HTMLInputElement>(null);

  const handleMediaFile = (file: File) => {
    if (file.type.startsWith('audio/') || file.type.startsWith('video/')) setAudioFile(file);
    else alert("Please upload an audio or video file.");
  };

  const handleMediaFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) handleMediaFile(e.target.files[0]);
  };

  const handleBaselineFile = (file: File) => {
    setBaselineFile(file);
    setHumanScore('');
  };

  const handleBaselineFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) handleBaselineFile(e.target.files[0]);
  };

  const handleScoreChange = (e: ChangeEvent<HTMLInputElement>) => {
    setHumanScore(e.target.value);
    if (e.target.value !== '') setBaselineFile(null);
  };

  const preventDefaults = (e: DragEvent<HTMLDivElement>) => e.preventDefault();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], "recorded_audio.webm", { type: 'audio/webm' });
        setAudioFile(file);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) { alert("Microphone access denied."); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const startAnalysis = async () => {
    if (!audioFile || (!humanScore && !baselineFile)) return;
    setIsProcessing(true);
    setResults(null);

    const formData = new FormData();
    formData.append("audio", audioFile);
    if (baselineFile) formData.append("baseline_file", baselineFile);
    formData.append("human_score", humanScore || "0");

    try {
      const response = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Backend processing failed");
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error(error);
      alert("Error connecting to the AI backend. Is the Python server running?");
    } finally {
      setIsProcessing(false);
    }
  };

  const isFormReady = audioFile && (humanScore || baselineFile) && !isProcessing && !isRecording;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      <AmbientBackground />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ padding: '60px 20px', maxWidth: '1000px', margin: '0 auto', width: '100%', boxSizing: 'border-box', zIndex: 1 }}
      >
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            style={{ display: 'inline-block', padding: '6px 14px', backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '20px', color: '#38bdf8', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1.5px', marginBottom: '20px', textTransform: 'uppercase', boxShadow: '0 0 15px rgba(56, 189, 248, 0.2)' }}
          >
            System Prototype
          </motion.div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '800', margin: '0 0 15px 0', background: 'linear-gradient(135deg, #e0f2fe 0%, #38bdf8 50%, #fb923c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1.5px', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            AI Audio Grader
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.2rem', margin: 0, fontWeight: '400', maxWidth: '600px', marginInline: 'auto' }}>
            Automated Rubric-Based Scoring via LangChain & ASR
          </p>
        </header>

        <div style={{ display: 'flex', gap: '30px', marginBottom: '50px', flexWrap: 'wrap' }}>
          
          {/* --- LEFT COLUMN: MEDIA INPUT (BLUE ACCENT) --- */}
          <motion.div className="glass-panel" style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', padding: '30px', borderRadius: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#38bdf8', boxShadow: '0 0 10px #38bdf8' }} />
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.2rem', fontWeight: '600' }}>Audio Input</h3>
            </div>
            
            <motion.div 
              onDragOver={(e) => { preventDefaults(e); setIsDraggingMedia(true); }}
              onDragLeave={(e) => { preventDefaults(e); setIsDraggingMedia(false); }}
              onDrop={(e) => { preventDefaults(e); setIsDraggingMedia(false); if (e.dataTransfer.files.length > 0) handleMediaFile(e.dataTransfer.files[0]); }}
              onClick={() => !isRecording && mediaInputRef.current?.click()}
              whileHover={!isRecording ? { scale: 1.02, backgroundColor: 'rgba(56, 189, 248, 0.05)' } : {}}
              style={{ flex: 1, padding: '40px 20px', border: `2px dashed ${isDraggingMedia || audioFile ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`, borderRadius: '16px', textAlign: 'center', cursor: isRecording ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', minHeight: '220px', backgroundColor: 'rgba(0,0,0,0.2)' }}
            >
              <input type="file" accept="audio/*,video/*" ref={mediaInputRef} onChange={handleMediaFileChange} style={{ display: 'none' }} />
              {audioFile ? (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <FileAudioIcon />
                  <p style={{ color: '#f8fafc', fontWeight: '600', marginTop: '15px', marginBottom: '5px' }}>{audioFile.name}</p>
                  <p style={{ color: '#38bdf8', fontSize: '0.9rem', margin: 0 }}>Ready for ASR</p>
                  <button onClick={(e) => { e.stopPropagation(); setAudioFile(null); }} style={{ marginTop: '20px', padding: '8px 16px', fontSize: '0.8rem', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>Remove Media</button>
                </motion.div>
              ) : (
                <>
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 3 }} style={{ color: isDraggingMedia ? '#38bdf8' : '#64748b', marginBottom: '15px' }}><UploadIcon /></motion.div>
                  <p style={{ color: '#e2e8f0', fontWeight: '500', margin: '0 0 8px 0', fontSize: '1.1rem' }}>{isDraggingMedia ? 'Deploy media here' : 'Select or drag media'}</p>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>WAV, MP3, MP4</p>
                </>
              )}
            </motion.div>

            <div style={{ marginTop: '25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ color: '#475569', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>System Record</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            </div>

            <motion.button 
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={(e) => { e.stopPropagation(); isRecording ? stopRecording() : startRecording(); }} 
              style={{ marginTop: '20px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px 0', backgroundColor: isRecording ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.03)', color: isRecording ? '#ef4444' : '#e2e8f0', border: `1px solid ${isRecording ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '12px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s', boxShadow: isRecording ? '0 0 20px rgba(239, 68, 68, 0.2)' : 'none' }}
            >
              {isRecording ? (
                <><motion.div animate={{ opacity: [1, 0.3, 1], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '50%', boxShadow: '0 0 10px #ef4444' }} /> Terminate Recording</>
              ) : (
                <><MicIcon /> Initialize Microphone</>
              )}
            </motion.button>
          </motion.div>

          {/* --- RIGHT COLUMN: BASELINE CONFIG (ORANGE ACCENT) --- */}
          <motion.div className="glass-panel" style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', padding: '30px', borderRadius: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#fb923c', boxShadow: '0 0 10px #fb923c' }} />
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.2rem', fontWeight: '600' }}>Baseline Rubric</h3>
            </div>
            
            <motion.div 
              onDragOver={(e) => { preventDefaults(e); setIsDraggingBaseline(true); }}
              onDragLeave={(e) => { preventDefaults(e); setIsDraggingBaseline(false); }}
              onDrop={(e) => { preventDefaults(e); setIsDraggingBaseline(false); if (e.dataTransfer.files.length > 0) handleBaselineFile(e.dataTransfer.files[0]); }}
              onClick={() => baselineInputRef.current?.click()}
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(251, 146, 60, 0.05)' }}
              style={{ flex: 1, padding: '40px 20px', border: `2px dashed ${isDraggingBaseline || baselineFile ? '#fb923c' : 'rgba(255,255,255,0.1)'}`, borderRadius: '16px', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', minHeight: '220px', backgroundColor: 'rgba(0,0,0,0.2)' }}
            >
              <input type="file" accept=".pdf,.txt,.csv,.docx" ref={baselineInputRef} onChange={handleBaselineFileChange} style={{ display: 'none' }} />
              {baselineFile ? (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <FileDocumentIcon />
                  <p style={{ color: '#f8fafc', fontWeight: '600', marginTop: '15px', marginBottom: '5px' }}>{baselineFile.name}</p>
                  <p style={{ color: '#fb923c', fontSize: '0.9rem', margin: 0 }}>Rubric Loaded</p>
                  <button onClick={(e) => { e.stopPropagation(); setBaselineFile(null); }} style={{ marginTop: '20px', padding: '8px 16px', fontSize: '0.8rem', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>Remove Document</button>
                </motion.div>
              ) : (
                <>
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 3, delay: 0.5 }} style={{ color: isDraggingBaseline ? '#fb923c' : '#64748b', marginBottom: '15px' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                  </motion.div>
                  <p style={{ color: '#e2e8f0', fontWeight: '500', margin: '0 0 8px 0', fontSize: '1.1rem' }}>{isDraggingBaseline ? 'Deploy document here' : 'Select or drag rubric file'}</p>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>PDF, TXT, DOCX</p>
                </>
              )}
            </motion.div>

            <div style={{ marginTop: '25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ color: '#475569', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Manual Override</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            </div>

            <div style={{ marginTop: '20px', position: 'relative', width: '100%' }}>
              <input 
                type="number" 
                placeholder="Enter Instructor Score" 
                value={humanScore} 
                onChange={handleScoreChange} 
                style={{ width: '100%', padding: '14px 20px', paddingRight: '40px', fontSize: '1rem', fontWeight: '500', backgroundColor: 'rgba(0,0,0,0.3)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxSizing: 'border-box', outline: 'none', transition: 'all 0.3s' }} 
                onFocus={(e) => { e.target.style.borderColor = '#fb923c'; e.target.style.boxShadow = '0 0 15px rgba(251, 146, 60, 0.2)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
              <span style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '1.1rem', fontWeight: '700' }}>%</span>
            </div>
          </motion.div>
        </div>

        {/* --- PROCESS BUTTON --- */}
        <motion.button 
          whileHover={{ scale: !isFormReady ? 1 : 1.02 }}
          whileTap={{ scale: !isFormReady ? 1 : 0.98 }}
          onClick={startAnalysis} 
          disabled={!isFormReady}
          style={{ width: '100%', padding: '24px', fontSize: '1.3rem', fontWeight: '700', letterSpacing: '1px', background: !isFormReady ? 'rgba(255,255,255,0.05)' : 'linear-gradient(90deg, #0284c7 0%, #3b82f6 50%, #f97316 100%)', color: !isFormReady ? '#64748b' : 'white', border: !isFormReady ? '1px solid rgba(255,255,255,0.1)' : 'none', borderRadius: '20px', cursor: !isFormReady ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden', boxShadow: !isFormReady ? 'none' : '0 10px 40px -10px rgba(59, 130, 246, 0.6)' }}
        >
          {isProcessing && (
            <motion.div animate={{ backgroundPosition: ['200% 0', '-200% 0'] }} transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }} style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', backgroundSize: '200% 100%', position: 'absolute', inset: 0 }} />
          )}
          <span style={{ position: 'relative', zIndex: 1, textTransform: 'uppercase' }}>
            {isProcessing ? 'Executing LangChain Pipeline...' : 'Run Statistical Analysis'}
          </span>
        </motion.button>

        {/* --- RESULTS SECTION --- */}
        <AnimatePresence>
          {results && (
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50 }} transition={{ duration: 0.6, type: "spring", bounce: 0.3 }} style={{ marginTop: '60px' }}>
              <div className="glass-panel" style={{ padding: '50px', borderRadius: '30px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #38bdf8, #fb923c, #38bdf8)', backgroundSize: '200% auto', animation: 'gradientFlow 3s linear infinite' }} />
                
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                  <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Comparative Analysis</h2>
                  <p style={{ color: '#94a3b8', marginTop: '10px' }}>Human Control vs. LLM Rubric Evaluation</p>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                  <div style={{ textAlign: 'center', flex: '1 1 120px' }}>
                    <p style={{ margin: 0, color: '#fb923c', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px' }}>Instructor Score</p>
                    <h1 style={{ margin: '20px 0', fontSize: '5rem', color: '#f8fafc', fontWeight: '800', textShadow: '0 0 40px rgba(251, 146, 60, 0.2)' }}>{results.humanScore}</h1>
                  </div>
                  
                  <div style={{ textAlign: 'center', flex: '1 1 120px', padding: '0 20px', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ margin: 0, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px' }}>Score Delta</p>
                    <h1 style={{ margin: '20px 0', fontSize: '4rem', fontWeight: '800', color: results.variance > 10 ? '#ef4444' : '#10b981', textShadow: results.variance > 10 ? '0 0 30px rgba(239, 68, 68, 0.4)' : '0 0 30px rgba(16, 185, 129, 0.4)' }}>
                      ±{results.variance}
                    </h1>
                  </div>
                  
                  <div style={{ textAlign: 'center', flex: '1 1 120px' }}>
                    <p style={{ margin: 0, color: '#38bdf8', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px' }}>AI Evaluation</p>
                    <h1 style={{ margin: '20px 0', fontSize: '5rem', color: '#f8fafc', fontWeight: '800', textShadow: '0 0 40px rgba(56, 189, 248, 0.3)' }}>{results.aiScore}</h1>
                  </div>
                </div>

                <div style={{ marginTop: '50px', padding: '30px', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#38bdf8', borderRadius: '50%', boxShadow: '0 0 10px #38bdf8' }}></div>
                    <strong style={{ color: '#e2e8f0', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>ASR Extraction Log</strong>
                  </div>
                  <p style={{ fontStyle: 'italic', margin: 0, color: '#cbd5e1', lineHeight: '1.8', fontSize: '1.1rem', borderLeft: '2px solid #38bdf8', paddingLeft: '20px' }}>"{results.transcriptionSnippet}"</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}