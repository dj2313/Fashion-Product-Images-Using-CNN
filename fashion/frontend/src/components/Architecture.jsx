import React from 'react';
import { motion } from 'framer-motion';

const cnnLayers = [
  { title: 'Block 1', detail: 'Conv2d (16) → ReLU → MaxPool (2×2)' },
  { title: 'Block 2', detail: 'Conv2d (32) → ReLU → MaxPool (2×2)' },
  { title: 'Block 3', detail: 'Conv2d (64) → ReLU → AdaptiveAvgPool' },
  { title: 'Classifier', detail: 'Linear (128) → ReLU → Linear (5)', fc: true },
];

const mobileFeatures = [
  { label: 'Parameters', value: '~1.5M (Trainable)' },
  { label: 'Input Size', value: '224×224×3' },
  { label: 'Modifications', value: 'Replaced classifier with Linear(576, 128) → Hardswish → Linear(128, 5)' },
];

export default function Architecture() {
  return (
    <section id="architecture" className="section section-alt">
      <div className="container">
        <div className="section-header">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Neural Architecture
          </motion.h2>
        </div>

        <div className="grid-2">
          {/* Custom CNN */}
          <motion.div
            className="card"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3>Custom CNN Backbone</h3>
            <p style={{ marginTop: 'var(--space-xs)' }}>
              Lightweight 3-block convolutional network with a fully connected classifier head.
            </p>
            <div className="arch-diagram">
              {cnnLayers.map((layer, i) => (
                <React.Fragment key={layer.title}>
                  <motion.div
                    className={`arch-block ${layer.fc ? 'fc' : ''}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 + i * 0.08 }}
                  >
                    <div className="arch-title">{layer.title}</div>
                    <div className="arch-detail">{layer.detail}</div>
                  </motion.div>
                  {i < cnnLayers.length - 1 && <div className="arch-arrow">↓</div>}
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          {/* MobileNetV3 */}
          <motion.div
            className="card"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <h3>MobileNetV3-Small</h3>
            <p style={{ marginTop: 'var(--space-xs)' }}>
              Transfer learning with depthwise separable convolutions and inverted residual blocks.
            </p>
            <ul className="model-features">
              {mobileFeatures.map(f => (
                <li key={f.label}><strong>{f.label}:</strong> {f.value}</li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
