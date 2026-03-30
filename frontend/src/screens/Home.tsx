import { useState, useRef, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GradingResults {
  humanScore: number;
  aiScore: number;
  transcriptionSnippet: string;
  variance: number;
}

export default function Home() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [humanScore, setHumanScore] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [results, setResults] = useState<GradingResults | null>(null);

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  // 1. Handle File / Score Changes
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setAudioFile(e.target.files[0]);
  };
  const handleScoreChange = (e: ChangeEvent<HTMLInputElement>) => setHumanScore(e.target.value);

  // 2. Microphone Logic
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

  // 3. ACTUAL Backend API Call
  const startAnalysis = async () => {
    if (!audioFile || !humanScore) return alert("Please provide both an audio file and a human score.");
    
    setIsProcessing(true);
    setResults(null);

    // Prepare data for FastAPI (must use FormData for files)
    const formData = new FormData();
    formData.append("audio", audioFile);
    formData.append("human_score", humanScore);

    try {
      // Fetching from our local Python server!
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      style={{ padding: '40px', maxWidth: '850px', margin: '0 auto', fontFamily: 'sans-serif', color: '#333' }}
    >
      <h1 style={{ textAlign: 'center', fontWeight: 'bold' }}>Research Prototype: AI vs Human Evaluator</h1>
      <p style={{ textAlign: 'center', color: '#666' }}>Upload or record audio to compare rubric-based scoring.</p>
      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eaeaea' }}/>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        {/* Audio Input Box */}
        <motion.div whileHover={{ scale: 1.01 }} style={{ flex: 1, padding: '25px', backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <h3 style={{ marginTop: 0 }}>1. Student Audio</h3>
          <div style={{ marginBottom: '15px' }}>
            <button onClick={isRecording ? stopRecording : startRecording} style={{ padding: '10px 18px', backgroundColor: isRecording ? '#ef4444' : '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' }}>
              {isRecording ? '⏹ Stop Recording' : '⏺ Record Audio'}
            </button>
            <span style={{ margin: '0 10px', color: '#999', fontSize: '0.9em' }}>or</span>
          </div>
          <input type="file" accept="audio/*" onChange={handleFileChange} style={{ width: '100%', cursor: 'pointer' }} />
          {audioFile && <motion.small initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#10b981', display: 'block', marginTop: '10px', fontWeight: '500' }}>✔ Loaded: {audioFile.name}</motion.small>}
        </motion.div>

        {/* Score Input Box */}
        <motion.div whileHover={{ scale: 1.01 }} style={{ flex: 1, padding: '25px', backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <h3 style={{ marginTop: 0 }}>2. Instructor's Score</h3>
          <input type="number" placeholder="Enter grade (e.g. 90)" value={humanScore} onChange={handleScoreChange} style={{ width: '100%', padding: '12px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }} />
          <small style={{ color: '#666', display: 'block', marginTop: '10px' }}>Baseline human grade for variance comparison.</small>
        </motion.div>
      </div>

      <motion.button 
        whileTap={{ scale: 0.98 }}
        onClick={startAnalysis} 
        disabled={!audioFile || !humanScore || isProcessing || isRecording}
        style={{ width: '100%', padding: '16px', fontSize: '18px', fontWeight: 'bold', backgroundColor: (!audioFile || !humanScore || isProcessing || isRecording) ? '#d1d5db' : '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: (!audioFile || !humanScore || isProcessing || isRecording) ? 'not-allowed' : 'pointer', transition: 'background 0.3s' }}
      >
        {isProcessing ? 'Analyzing with LangChain...' : 'Run Comparative Analysis'}
      </motion.button>

      {/* Animated Results Card */}
      <AnimatePresence>
        {results && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: 20 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4, type: "spring" }}
            style={{ overflow: 'hidden', marginTop: '40px' }}
          >
            <div style={{ padding: '30px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: '6px solid #3b82f6', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
              <h2 style={{ marginTop: 0, color: '#1e293b' }}>Statistical Variance Report</h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '25px', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <p style={{ margin: 0, color: '#64748b', fontWeight: '500', textTransform: 'uppercase', fontSize: '0.85em' }}>Human Score</p>
                  <h1 style={{ margin: '10px 0', fontSize: '3.5rem', color: '#0f172a' }}>{results.humanScore}</h1>
                </div>
                <div style={{ textAlign: 'center', flex: 1, borderLeft: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1' }}>
                  <p style={{ margin: 0, color: '#64748b', fontWeight: '500', textTransform: 'uppercase', fontSize: '0.85em' }}>Δ Delta</p>
                  <h1 style={{ margin: '10px 0', fontSize: '3.5rem', color: results.variance > 10 ? '#ef4444' : '#10b981' }}>±{results.variance}</h1>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <p style={{ margin: 0, color: '#64748b', fontWeight: '500', textTransform: 'uppercase', fontSize: '0.85em' }}>AI Score</p>
                  <h1 style={{ margin: '10px 0', fontSize: '3.5rem', color: '#3b82f6' }}>{results.aiScore}</h1>
                </div>
              </div>
              <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#475569' }}>ASR Transcript Snippet:</strong>
                <p style={{ fontStyle: 'italic', margin: '10px 0 0 0', color: '#334155', lineHeight: '1.5' }}>"{results.transcriptionSnippet}"</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}