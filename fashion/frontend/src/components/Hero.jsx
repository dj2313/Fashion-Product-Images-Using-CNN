import React from 'react';
import { motion } from 'framer-motion';

const pills = ['Topwear', 'Shoes', 'Bags', 'Bottomwear', 'Watches'];

export default function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="hero-glow" />
      <div className="container hero-content">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          AI-Assisted Fashion <span className="neon-text">Attribute Screening System</span>
        </motion.h1>

        <motion.p
          className="subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <span className="badge">Decision-Support Tool for Human Inventory Experts</span>
        </motion.p>

        <motion.p
          className="description"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          Real-time image recognition powered by deep learning. Trained on 31,000+ Kaggle products to categorize apparel instantly.
        </motion.p>

        <div className="pills-row">
          {pills.map((pill, i) => (
            <motion.span
              key={pill}
              className="pill"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
            >
              {pill}
            </motion.span>
          ))}
        </div>

        <motion.a
          href="#predict"
          className="btn btn-primary"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Initialize Model
        </motion.a>
      </div>
    </section>
  );
}
