import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DatasetStats from './components/DatasetStats';
import Architecture from './components/Architecture';
import Predictor from './components/Predictor';
import Results from './components/Results';

function App() {
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
