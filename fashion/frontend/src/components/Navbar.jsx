import React from 'react';
import { motion } from 'framer-motion';

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="nav-content">
        <div className="logo">Fashion<span className="neon-text">CNN</span></div>
        <div className="nav-links">
          <a href="#hero">Home</a>
          <a href="#dataset">Dataset</a>
          <a href="#architecture">Architecture</a>
          <a href="#predict">Predict</a>
          <a href="#results">Results</a>
        </div>
      </div>
    </motion.nav>
  );
}
