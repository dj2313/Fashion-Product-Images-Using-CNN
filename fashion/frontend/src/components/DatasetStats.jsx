import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Tag, ScanSearch, Wifi, WifiOff } from 'lucide-react';

export default function DatasetStats() {
  const [stats, setStats] = useState({ distribution: {}, total: 0, classes: 0 });
  const [status, setStatus] = useState('loading'); // 'loading' | 'ok' | 'error'

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || '';
    fetch(`${API_URL}/stats`)
      .then(r => {
        if (!r.ok) throw new Error('Backend unavailable');
        return r.json();
      })
      .then(data => {
        const total = Object.values(data.distribution).reduce((a, b) => a + b, 0);
        setStats({
          distribution: data.distribution,
          total,
          classes: Object.keys(data.distribution).length,
        });
        setStatus('ok');
      })
      .catch(() => setStatus('error'));
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

        {/* Backend Status Banner */}
        {status === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.75rem 1.2rem', marginBottom: '1.5rem',
              borderRadius: '10px', fontSize: '0.9rem',
              background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
              color: '#a5b4fc'
            }}
          >
            <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>
              ⏳ Waking up the backend (Render free tier may take ~30s)…
            </motion.span>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.75rem 1.2rem', marginBottom: '1.5rem',
              borderRadius: '10px', fontSize: '0.9rem',
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5'
            }}
          >
            <WifiOff size={16} />
            Backend is still waking up — stats will appear once it's ready. Predictions will still work after the server starts.
          </motion.div>
        )}

        {status === 'ok' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.5rem 1rem', marginBottom: '1.5rem',
              borderRadius: '10px', fontSize: '0.85rem',
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
              color: '#86efac', width: 'fit-content'
            }}
          >
            <Wifi size={14} /> Backend connected
          </motion.div>
        )}

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
              <div className="stat-value">
                {status === 'loading' ? (
                  <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }}>…</motion.span>
                ) : (
                  s.value || '–'
                )}
              </div>
              <div className="stat-label">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {Object.keys(stats.distribution).length > 0 && (
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
        )}
      </div>
    </section>
  );
}
