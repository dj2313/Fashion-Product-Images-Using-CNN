import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  { num: 1, title: 'Load', desc: '31K Kaggle images' },
  { num: 2, title: 'Preprocess', desc: 'Resize 224×224 & Normalize' },
  { num: 3, title: 'Augment', desc: 'H-Flip & Random Rotation' },
  { num: 4, title: 'Train', desc: 'Adam & Cross-Entropy' },
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

        {/* PDF Cards */}
        <div className="grid-2">
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3>Confusion Matrix</h3>
            <div className="pdf-frame">
              <embed
                src="/static/confusion_matrix.pdf?v=2"
                type="application/pdf"
                width="100%"
                height="100%"
              />
            </div>
          </motion.div>

          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <h3>Learning Curves</h3>
            <div className="pdf-frame">
              <embed
                src="/static/learning_curves.pdf?v=2"
                type="application/pdf"
                width="100%"
                height="100%"
              />
            </div>
          </motion.div>
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
