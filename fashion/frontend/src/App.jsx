import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DatasetStats from './components/DatasetStats';
import Architecture from './components/Architecture';
import Predictor from './components/Predictor';
import Results from './components/Results';

// Ping the Render backend immediately on page load so it wakes up
// before the user tries to upload an image (avoids ~30s cold start delay).
function useWakeUpBackend() {
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || '';
    if (!API_URL) return; // skip in local dev (proxy handles it)
    fetch(`${API_URL}/stats`, { method: 'GET' }).catch(() => {
      // Silently retry after 20s if first ping fails (still waking)
      setTimeout(() => fetch(`${API_URL}/stats`).catch(() => {}), 20000);
    });
  }, []);
}

function App() {
  useWakeUpBackend();

  return (
    <>
      <Navbar />
      <Hero />
      <DatasetStats />
      <Architecture />
      <Predictor />
      <Results />
      
      <footer>
        <div className="container">
          <p>&copy; 2026 Fashion CNN Classifier | Neural Networks Division</p>
        </div>
      </footer>
    </>
  );
}

export default App;
