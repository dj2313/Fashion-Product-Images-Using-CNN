import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  { num: 1, title: 'Load', desc: '31K Kaggle images' },
  { num: 2, title: 'Preprocess', desc: 'Resize 224×224 & Normalize' },
  { num: 3, title: 'Augment', desc: 'H-Flip & Random Rotation' },
  { num: 4, title: 'Train', desc: 'Adam & Cross-Entropy' },
];

// Image cards replace the old PDF <embed> tags.
// Images are bundled into the frontend (public/) so Vercel can serve them
// without requiring the Render backend to be awake.
const charts = [
  {
    title: 'Confusion Matrix',
    src: '/confusion_matrix.png',
    alt: 'Confusion Matrix heatmap showing per-class accuracy',
  },
  {
    title: 'Learning Curves',
    src: '/learning_curves.png',
    alt: 'Training and validation loss/accuracy over epochs',
  },
];

export default function Results() {
  return (
    <section id="results" className="section section-alt">
      <div className="container">
        <div className="section-header">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Evaluation & Pipeline
          </motion.h2>
        </div>

        {/* Chart Images (previously PDF embeds) */}
        <div className="grid-2">
          {charts.map((chart, i) => (
            <motion.div
              key={chart.title}
              className="card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <h3>{chart.title}</h3>
              <div
                className="pdf-frame"
                style={{
                  overflow: 'hidden',
                  borderRadius: '8px',
                  background: 'var(--surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={chart.src}
                  alt={chart.alt}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                {/* Fallback message if image fails to load */}
                <div
                  style={{
                    display: 'none',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '2rem',
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                  }}
                >
                  <span>📊</span>
                  <span>{chart.title} — unavailable</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pipeline */}
        <motion.div
          className="card"
          style={{ marginTop: 'var(--space-md)' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <h3>Data Pipeline</h3>
          <div className="pipeline-row">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                className="pipeline-step"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.08 }}
                whileHover={{ y: -3 }}
              >
                <div className="step-number">{s.num}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
