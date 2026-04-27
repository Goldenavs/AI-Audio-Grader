import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InteractiveBackground from '../components/InteractiveBackground';
import GlowingCard from '../components/GlowingCard';

// Keep your existing GradingResults interface and custom Icons here...
interface GradingResults {
  humanScore: number;
  aiScore: number;
  transcriptionSnippet: string;
  variance: number;
}

const UploadIcon = () => (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>);
const MicIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>);
const FileAudioIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>);
const FileDocumentIcon = () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>);

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

  const handleMediaFile = (file: File) => { if (file.type.startsWith('audio/') || file.type.startsWith('video/')) setAudioFile(file); else alert("Please upload an audio or video file."); };
  const handleMediaFileChange = (e: ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files.length > 0) handleMediaFile(e.target.files[0]); };
  const handleBaselineFile = (file: File) => { setBaselineFile(file); setHumanScore(''); };
  const handleBaselineFileChange = (e: ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files.length > 0) handleBaselineFile(e.target.files[0]); };
  const handleScoreChange = (e: ChangeEvent<HTMLInputElement>) => { setHumanScore(e.target.value); if (e.target.value !== '') setBaselineFile(null); };
  const preventDefaults = (e: DragEvent<HTMLDivElement>) => e.preventDefault();

  const startRecording = async () => { setIsRecording(true); };
  const stopRecording = () => { setIsRecording(false); };
  
  const startAnalysis = async () => {
    if (!audioFile || (!humanScore && !baselineFile)) return;
    setIsProcessing(true);
    // Mocking API call for prototype flow
    setTimeout(() => {
      setResults({ humanScore: Number(humanScore) || 85, aiScore: 82, transcriptionSnippet: "The student accurately described the phases of mitosis...", variance: 3 });
      setIsProcessing(false);
    }, 2000);
  };

  const isFormReady = audioFile && (humanScore || baselineFile) && !isProcessing && !isRecording;

  // Manual spring transition for that smooth bounce
  const springTransition = { type: "spring" as const, stiffness: 300, damping: 24 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      <InteractiveBackground />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ padding: '80px 20px', maxWidth: '1100px', margin: '0 auto', width: '100%', boxSizing: 'border-box', zIndex: 1 }}
      >
        {/* HEADER - Delay 0.1s */}
        <motion.header 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1, ...springTransition }}
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <div style={{ display: 'inline-block', padding: '6px 16px', backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '20px', color: '#38bdf8', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '2px', marginBottom: '20px', textTransform: 'uppercase' }}>
            A.I. Research Prototype
          </div>
          <h1 style={{ fontSize: '4rem', fontWeight: '800', margin: '0 0 15px 0', background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-2px' }}>
            Audio Grader<span style={{ color: '#38bdf8' }}>.</span>
          </h1>
        </motion.header>

        <div style={{ display: 'flex', gap: '30px', marginBottom: '40px', flexWrap: 'wrap' }}>
          
          {/* LEFT COLUMN - Delay 0.2s */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2, ...springTransition }}
            style={{ flex: '1 1 450px' }}
          >
            <GlowingCard accentColor="blue" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#38bdf8', boxShadow: '0 0 15px #38bdf8' }} />
                <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.3rem', fontWeight: '600' }}>Audio Source</h3>
              </div>
              
              <motion.div 
                onDragOver={(e) => { preventDefaults(e); setIsDraggingMedia(true); }}
                onDragLeave={(e) => { preventDefaults(e); setIsDraggingMedia(false); }}
                onDrop={(e) => { preventDefaults(e); setIsDraggingMedia(false); if (e.dataTransfer.files.length > 0) handleMediaFile(e.dataTransfer.files[0]); }}
                onClick={() => !isRecording && mediaInputRef.current?.click()}
                whileHover={!isRecording ? { scale: 1.01, backgroundColor: 'rgba(56, 189, 248, 0.08)' } : {}}
                style={{ flex: 1, padding: '40px 20px', border: `2px dashed ${isDraggingMedia || audioFile ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`, borderRadius: '16px', textAlign: 'center', cursor: isRecording ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', minHeight: '220px', backgroundColor: 'rgba(0,0,0,0.3)' }}
              >
                <input type="file" accept="audio/*,video/*" ref={mediaInputRef} onChange={handleMediaFileChange} style={{ display: 'none' }} />
                {audioFile ? (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <FileAudioIcon />
                    <p style={{ color: '#f8fafc', fontWeight: '600', marginTop: '15px' }}>{audioFile.name}</p>
                    <button onClick={(e) => { e.stopPropagation(); setAudioFile(null); }} style={{ marginTop: '10px', padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', borderRadius: '8px', cursor: 'pointer' }}>Remove</button>
                  </motion.div>
                ) : (
                  <>
                    <UploadIcon />
                    <p style={{ color: '#e2e8f0', fontWeight: '500', marginTop: '15px' }}>{isDraggingMedia ? 'Deploy media here' : 'Select or drag media'}</p>
                  </>
                )}
              </motion.div>
            </GlowingCard>
          </motion.div>

          {/* RIGHT COLUMN - Delay 0.3s */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3, ...springTransition }}
            style={{ flex: '1 1 450px' }}
          >
            <GlowingCard accentColor="orange" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#fb923c', boxShadow: '0 0 15px #fb923c' }} />
                <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.3rem', fontWeight: '600' }}>Evaluation Rubric</h3>
              </div>
              
              <motion.div 
                onDragOver={(e) => { preventDefaults(e); setIsDraggingBaseline(true); }}
                onDragLeave={(e) => { preventDefaults(e); setIsDraggingBaseline(false); }}
                onDrop={(e) => { preventDefaults(e); setIsDraggingBaseline(false); if (e.dataTransfer.files.length > 0) handleBaselineFile(e.dataTransfer.files[0]); }}
                onClick={() => baselineInputRef.current?.click()}
                whileHover={{ scale: 1.01, backgroundColor: 'rgba(251, 146, 60, 0.08)' }}
                style={{ flex: 1, padding: '40px 20px', border: `2px dashed ${isDraggingBaseline || baselineFile ? '#fb923c' : 'rgba(255,255,255,0.1)'}`, borderRadius: '16px', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', minHeight: '140px', backgroundColor: 'rgba(0,0,0,0.3)' }}
              >
                <input type="file" accept=".pdf,.txt,.docx" ref={baselineInputRef} onChange={handleBaselineFileChange} style={{ display: 'none' }} />
                {baselineFile ? (
                   <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                     <FileDocumentIcon />
                     <p style={{ color: '#f8fafc', fontWeight: '600', marginTop: '15px' }}>{baselineFile.name}</p>
                   </motion.div>
                ) : (
                  <p style={{ color: '#e2e8f0', fontWeight: '500' }}>Drop Rubric PDF/TXT here</p>
                )}
              </motion.div>

              <div style={{ marginTop: '20px', position: 'relative' }}>
                <input 
                  type="number" placeholder="Or enter manual Instructor Score (%)" value={humanScore} onChange={handleScoreChange} 
                  style={{ width: '100%', padding: '16px 20px', fontSize: '1rem', backgroundColor: 'rgba(0,0,0,0.4)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxSizing: 'border-box', outline: 'none', transition: 'all 0.3s' }} 
                  onFocus={(e) => e.target.style.borderColor = '#fb923c'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </GlowingCard>
          </motion.div>
        </div>

        {/* PROCESS BUTTON - Delay 0.4s */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4, ...springTransition }}
        >
          <motion.button 
            whileHover={{ scale: !isFormReady ? 1 : 1.01 }} whileTap={{ scale: !isFormReady ? 1 : 0.98 }}
            onClick={startAnalysis} disabled={!isFormReady}
            style={{ width: '100%', padding: '24px', fontSize: '1.2rem', fontWeight: '700', letterSpacing: '2px', background: !isFormReady ? 'rgba(30, 41, 59, 0.5)' : 'linear-gradient(90deg, #0284c7, #ea580c)', color: !isFormReady ? '#64748b' : 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', cursor: !isFormReady ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', textTransform: 'uppercase' }}
          >
            {isProcessing ? 'Executing AI Pipeline...' : 'Run Analysis'}
          </motion.button>
        </motion.div>
        
        {/* --- RESULTS SECTION --- */}
        <AnimatePresence>
          {results && (
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50 }} transition={{ duration: 0.6, type: "spring", bounce: 0.3 }} style={{ marginTop: '60px' }}>
              <div style={{ padding: '50px', borderRadius: '30px', position: 'relative', overflow: 'hidden', backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)' }}>
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