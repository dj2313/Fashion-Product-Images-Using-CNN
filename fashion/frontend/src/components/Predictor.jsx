import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload } from 'lucide-react';

export default function Predictor() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [modelName, setModelName] = useState('cnn');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  const handleFile = (f) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    const fd = new FormData();
    fd.append('image', file);
    fd.append('model_name', modelName);
    try {
      const res = await fetch('/predict', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setResult(data);
    } catch {
      setError('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="predict" className="section">
      <div className="container">
        <div className="section-header">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Live Prediction
          </motion.h2>
          <p>Upload a fashion image and let the model classify it in real time.</p>
        </div>

        <motion.div
          className="card predict-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <form onSubmit={handleSubmit}>
            {/* Model Select */}
            <div className="form-group">
              <label htmlFor="model-select">Inference Engine</label>
              <select
                id="model-select"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
              >
                <option value="cnn">Custom CNN</option>
                <option value="mobilenet">MobileNetV3-Small</option>
              </select>
            </div>

            {/* Upload Zone */}
            <div
              className="upload-zone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
              }}
              onClick={() => fileRef.current?.click()}
            >
              <input
                type="file"
                ref={fileRef}
                accept=".jpg,.jpeg,.png"
                hidden
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <AnimatePresence mode="wait">
                {preview ? (
                  <motion.img
                    key="img"
                    src={preview}
                    alt="Preview"
                    className="image-preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                ) : (
                  <motion.div
                    key="ph"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                  >
                    <div className="icon-wrapper">
                      <Upload />
                    </div>
                    <p>Click or drag an image here</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={!file || loading}
              whileHover={!file || loading ? {} : { scale: 1.02 }}
              whileTap={!file || loading ? {} : { scale: 0.98 }}
            >
              {loading ? 'Processing…' : 'Execute Inference'}
            </motion.button>
          </form>

          {/* Loading */}
          <AnimatePresence>
            {loading && (
              <motion.div
                className="shimmer-loader"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="shimmer-bar" />
                <motion.span
                  className="shimmer-text"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Processing tensor operations…
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="error-box"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result */}
          <AnimatePresence>
            {result && !loading && (
              <motion.div
                className="result-divider"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <span className="result-label">Identified Classification</span>
                <h2 className="result-class neon-text">{result.class}</h2>
                <div className="confidence-badge">
                  {result.confidence.toFixed(2)}% Confidence
                </div>

                <h4 className="scores-title">Probability Distribution</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {Object.entries(result.all_scores)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cls, score], idx) => {
                      const pct = (score * 100).toFixed(2);
                      return (
                        <div key={cls} className="bar-row">
                          <div className="bar-label">{cls}</div>
                          <div className="bar-track">
                            <motion.div
                              className="bar-fill"
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, delay: idx * 0.08, ease: 'easeOut' }}
                            />
                          </div>
                          <div className="bar-value">{pct}%</div>
                        </div>
                      );
                    })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
