import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Tag, ScanSearch } from 'lucide-react';

export default function DatasetStats() {
  const [stats, setStats] = useState({ distribution: {}, total: 0, classes: 0 });

  useEffect(() => {
    fetch('/stats')
      .then(r => r.json())
      .then(data => {
        const total = Object.values(data.distribution).reduce((a, b) => a + b, 0);
        setStats({
          distribution: data.distribution,
          total,
          classes: Object.keys(data.distribution).length,
        });
      })
      .catch(() => {});
  }, []);

  const maxVal = Math.max(...Object.values(stats.distribution), 1);

  const statCards = [
    { icon: <BarChart3 />, value: stats.total.toLocaleString(), label: 'Total Images' },
    { icon: <Tag />, value: stats.classes, label: 'Distinct Categories' },
    { icon: <ScanSearch />, value: '224×224', label: 'Input Resolution' },
  ];

  return (
    <section id="dataset" className="section">
      <div className="container">
        <div className="section-header">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Dataset Intelligence
          </motion.h2>
        </div>

        <div className="grid-3">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              className="card stat-box"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="card"
          style={{ marginTop: 'var(--space-md)' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <h3 style={{ marginBottom: 'var(--space-md)' }}>Class Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {Object.entries(stats.distribution).map(([key, val], idx) => (
              <div key={key} className="bar-row">
                <div className="bar-label">{key}</div>
                <div className="bar-track">
                  <motion.div
                    className="bar-fill"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(val / maxVal) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 + idx * 0.08, ease: 'easeOut' }}
                  />
                </div>
                <div className="bar-value">{val.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
