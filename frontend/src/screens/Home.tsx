import { useState } from 'react';

export default function Home() {
  // We will add TypeScript interfaces for these later!
  const [file, setFile] = useState<File | null>(null);

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>AI Research Grader</h1>
        <p>Upload an audio or video file to run the analysis.</p>
      </header>

      <section style={{ border: '2px dashed #ccc', padding: '2rem', textAlign: 'center', borderRadius: '8px' }}>
        {/* We will replace this with a proper file input/drag-and-drop later */}
        <p>File Upload Area Goes Here</p>
      </section>

      <section style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <h2>Results</h2>
        <p>No file processed yet.</p>
      </section>
    </main>
  );
}