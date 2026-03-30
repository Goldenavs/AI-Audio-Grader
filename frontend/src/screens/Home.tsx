import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GradingResults {
  humanScore: number;
  aiScore: number;
  transcriptionSnippet: string;
  variance: number;
}

// --- Custom UI Icons (No external libraries needed) ---
const UploadIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);
const MicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line>
  </svg>
);
const FileAudioIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>
  </svg>
);

export default function Home() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [humanScore, setHumanScore] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [results, setResults] = useState<GradingResults | null>(null);

  // Drag & Drop State
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  // --- File Handling Logic ---
  const handleFile = (file: File) => {
    // Basic validation to ensure it's media
    if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
      setAudioFile(file);
    } else {
      alert("Please upload an audio or video file.");
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) handleFile(e.target.files[0]);
  };

  const handleScoreChange = (e: ChangeEvent<HTMLInputElement>) => setHumanScore(e.target.value);

  // --- Drag and Drop Logic ---
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // --- Recording Logic ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], "recorded_audio.webm", { type: 'audio/webm' });
        setAudioFile(file);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // --- Backend API Call ---
  const startAnalysis = async () => {
    if (!audioFile || !humanScore) return;
    setIsProcessing(true);
    setResults(null);

    const formData = new FormData();
    formData.append("audio", audioFile);
    formData.append("human_score", humanScore);

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

  return (
    // Added a subtle background radial gradient for that "premium tech" feel
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, #1e293b 0%, #0f172a 100%)', display: 'flex', flexDirection: 'column' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{ padding: '60px 20px', maxWidth: '900px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}
      >
        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '20px', color: '#38bdf8', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '1px', marginBottom: '20px', textTransform: 'uppercase' }}>
            Prototype
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', margin: '0 0 15px 0', background: 'linear-gradient(135deg, #e0f2fe, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>
            AI AUDIO GRADER
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.2rem', margin: 0, fontWeight: '400' }}>Automated Rubric-Based Scoring via LangChain</p>
        </header>

        <div style={{ display: 'flex', gap: '30px', marginBottom: '40px', flexWrap: 'wrap' }}>
          
          {/* DRAG AND DROP ZONE */}
          <motion.div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginTop: 0, color: '#f8fafc', fontSize: '1.2rem', marginBottom: '15px' }}>1. Media Input</h3>
            
            <motion.div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isRecording && fileInputRef.current?.click()}
              animate={{ 
                borderColor: isDragging ? '#38bdf8' : (audioFile ? '#10b981' : '#334155'),
                backgroundColor: isDragging ? 'rgba(56, 189, 248, 0.05)' : '#1e293b'
              }}
              style={{ flex: 1, padding: '40px 20px', border: '2px dashed', borderRadius: '16px', textAlign: 'center', cursor: isRecording ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden' }}
            >
              {/* Hidden File Input */}
              <input type="file" accept="audio/*,video/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />

              {audioFile ? (
                // Selected File State
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <FileAudioIcon />
                  <p style={{ color: '#f8fafc', fontWeight: '600', marginTop: '15px', marginBottom: '5px' }}>{audioFile.name}</p>
                  <p style={{ color: '#10b981', fontSize: '0.9rem', margin: 0 }}>Ready for analysis</p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setAudioFile(null); }}
                    style={{ marginTop: '20px', padding: '6px 12px', fontSize: '0.8rem', backgroundColor: 'transparent', border: '1px solid #475569', color: '#94a3b8', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Remove File
                  </button>
                </motion.div>
              ) : (
                // Empty / Drag State
                <>
                  <div style={{ color: isDragging ? '#38bdf8' : '#64748b', marginBottom: '15px', transition: 'color 0.2s' }}>
                    <UploadIcon />
                  </div>
                  <p style={{ color: '#f8fafc', fontWeight: '500', margin: '0 0 8px 0', fontSize: '1.1rem' }}>
                    {isDragging ? 'Drop file to upload' : 'Click or drag file to this area'}
                  </p>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>MP3, WAV, or MP4 up to 50MB</p>
                </>
              )}
            </motion.div>

            {/* Microphone Controls */}
            <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
              <span style={{ color: '#475569', fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase' }}>OR</span>
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={(e) => { e.stopPropagation(); isRecording ? stopRecording() : startRecording(); }} 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: isRecording ? 'rgba(239, 68, 68, 0.1)' : '#1e293b', color: isRecording ? '#ef4444' : '#f8fafc', border: `1px solid ${isRecording ? '#ef4444' : '#334155'}`, borderRadius: '30px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}
              >
                {isRecording ? (
                  <>
                    {/* Pulsing red dot for live recording */}
                    <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '10px', height: '10px', backgroundColor: '#ef4444', borderRadius: '50%' }} />
                    Stop Recording
                  </>
                ) : (
                  <><MicIcon /> Record Live</>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* HUMAN SCORE INPUT */}
          <motion.div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginTop: 0, color: '#f8fafc', fontSize: '1.2rem', marginBottom: '15px' }}>2. Baseline Config</h3>
            <div style={{ flex: 1, padding: '40px 30px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '12px', display: 'block' }}>Instructor's Assessment Grade</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="number" 
                  placeholder="0 - 100" 
                  value={humanScore} 
                  onChange={handleScoreChange} 
                  style={{ width: '100%', padding: '20px', paddingRight: '50px', fontSize: '1.8rem', fontWeight: '700', backgroundColor: '#0f172a', color: '#f8fafc', border: '2px solid #334155', borderRadius: '12px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }} 
                  onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
                  onBlur={(e) => e.target.style.borderColor = '#334155'}
                />
                <span style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: '1.2rem', fontWeight: '700' }}>%</span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '15px', lineHeight: '1.5' }}>
                This acts as the control variable. The AI's generated score will be statistically compared against this baseline.
              </p>
            </div>
          </motion.div>
        </div>

        {/* PROCESS BUTTON */}
        <motion.button 
          whileHover={{ scale: (!audioFile || !humanScore || isProcessing || isRecording) ? 1 : 1.02, boxShadow: (!audioFile || !humanScore || isProcessing || isRecording) ? 'none' : '0 10px 25px -5px rgba(56, 189, 248, 0.4)' }}
          whileTap={{ scale: 0.98 }}
          onClick={startAnalysis} 
          disabled={!audioFile || !humanScore || isProcessing || isRecording}
          style={{ width: '100%', padding: '22px', fontSize: '1.3rem', fontWeight: '700', letterSpacing: '0.5px', background: (!audioFile || !humanScore || isProcessing || isRecording) ? '#1e293b' : 'linear-gradient(135deg, #0284c7, #3b82f6)', color: (!audioFile || !humanScore || isProcessing || isRecording) ? '#475569' : 'white', border: (!audioFile || !humanScore || isProcessing || isRecording) ? '1px solid #334155' : 'none', borderRadius: '16px', cursor: (!audioFile || !humanScore || isProcessing || isRecording) ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden' }}
        >
          {isProcessing ? (
            <motion.div animate={{ backgroundPosition: ['200% 0', '-200% 0'] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', backgroundSize: '200% 100%', position: 'absolute', inset: 0 }} />
          ) : null}
          <span style={{ position: 'relative', zIndex: 1 }}>
            {isProcessing ? 'Processing Audio Pipeline...' : 'Run Analysis Sequence'}
          </span>
        </motion.button>

        {/* RESULTS SECTION (Remains the same gorgeous style we just built) */}
        <AnimatePresence>
          {results && (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} transition={{ duration: 0.5, type: "spring", bounce: 0.4 }} style={{ marginTop: '50px' }}>
              <div style={{ padding: '40px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #3b82f6, #10b981, #3b82f6)', backgroundSize: '200% auto', animation: 'gradientFlow 3s linear infinite' }} />
                
                <h2 style={{ marginTop: 0, color: '#f8fafc', textAlign: 'center', marginBottom: '40px', fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Statistical Variance Report</h2>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                  <div style={{ textAlign: 'center', flex: '1 1 100px' }}>
                    <p style={{ margin: 0, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>Human Control</p>
                    <h1 style={{ margin: '15px 0', fontSize: '4.5rem', color: '#f8fafc', fontWeight: '800' }}>{results.humanScore}</h1>
                  </div>
                  
                  <div style={{ textAlign: 'center', flex: '1 1 100px', padding: '0 20px', borderLeft: '1px dashed #334155', borderRight: '1px dashed #334155' }}>
                    <p style={{ margin: 0, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>Δ Delta</p>
                    <h1 style={{ margin: '15px 0', fontSize: '3.5rem', fontWeight: '800', color: results.variance > 10 ? '#f43f5e' : '#10b981', textShadow: results.variance > 10 ? '0 0 30px rgba(244, 63, 94, 0.3)' : '0 0 30px rgba(16, 185, 129, 0.3)' }}>
                      ±{results.variance}
                    </h1>
                  </div>
                  
                  <div style={{ textAlign: 'center', flex: '1 1 100px' }}>
                    <p style={{ margin: 0, color: '#38bdf8', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>LangChain AI</p>
                    <h1 style={{ margin: '15px 0', fontSize: '4.5rem', color: '#38bdf8', fontWeight: '800', textShadow: '0 0 30px rgba(56, 189, 248, 0.2)' }}>{results.aiScore}</h1>
                  </div>
                </div>

                <div style={{ marginTop: '40px', padding: '25px', backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
                    <strong style={{ color: '#cbd5e1', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>ASR Transcript Extraction</strong>
                  </div>
                  <p style={{ fontStyle: 'italic', margin: 0, color: '#94a3b8', lineHeight: '1.7', fontSize: '1.1rem', borderLeft: '2px solid #334155', paddingLeft: '15px' }}>"{results.transcriptionSnippet}"</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}