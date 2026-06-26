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
  const [useGradCam, setUseGradCam] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [actionMsg, setActionMsg] = useState(null);
  const fileRef = useRef(null);

  const handleFile = (f) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
    setRecommendations([]);
    setActionMsg(null);
  };

  const handleApprove = () => {
    setActionMsg({ type: 'success', text: `✓ Successfully approved "${result.class}" to inventory!` });
    setTimeout(() => setActionMsg(null), 3500);
  };

  const handleOverride = () => {
    setActionMsg({ type: 'danger', text: `⚠ Flagged "${result.class}" for manual review.` });
    setTimeout(() => setActionMsg(null), 3500);
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
    fd.append('use_gradcam', useGradCam);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/predict`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        setResult(data);
        // Fetch recommendations
        try {
          const recRes = await fetch(`${API_URL}/recommendations?category=${data.class}`);
          const recData = await recRes.json();
          setRecommendations(recData.recommendations || []);
        } catch (err) {
          console.error("Failed to fetch recommendations:", err);
        }
      }
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
                {result && result.gradcam_image ? (
                  <motion.img
                    key="gradcam"
                    src={result.gradcam_image}
                    alt="Grad-CAM Heatmap"
                    className="image-preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                ) : preview ? (
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

            {/* Explainability Toggle */}
            <div className="explainability-toggle-container">
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={useGradCam}
                  onChange={(e) => setUseGradCam(e.target.checked)}
                />
                <span className="slider"></span>
                <span className="toggle-label">Overlay Grad-CAM Attention Heatmap</span>
              </label>
              <p className="toggle-helper">
                *Validates spatial trustworthiness by checking if the network focused on genuine object geometry instead of background studio noise.
              </p>
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
                <div className="decision-support-card">
                  <div className="ds-header">Decision Support Framework</div>
                  <span className="result-label">Identified Classification</span>
                  <h2 className="result-class neon-text">{result.class}</h2>
                  
                  <div className="confidence-container">
                    <div className="confidence-bar-bg">
                      <motion.div 
                        className="confidence-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidence}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                    <div className="confidence-badge">
                      {result.confidence.toFixed(1)}% System Confidence
                    </div>
                  </div>

                  <div className="ds-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button type="button" className="btn btn-success" onClick={handleApprove} style={{ flex: 1, whiteSpace: 'nowrap' }}>✓ Approve Tag to Inventory</button>
                    <button type="button" className="btn btn-danger" onClick={handleOverride} style={{ flex: 1, whiteSpace: 'nowrap' }}>⚠ Override Manually</button>
                  </div>
                  
                  <AnimatePresence>
                    {actionMsg && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }}
                        style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center', background: actionMsg.type === 'success' ? '#dcfce7' : '#fee2e2', color: actionMsg.type === 'success' ? '#166534' : '#991b1b', border: `1px solid ${actionMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}` }}
                      >
                        {actionMsg.text}
                      </motion.div>
                    )}
                  </AnimatePresence>
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

                {/* Recommendations Section */}
                {recommendations && recommendations.length > 0 && (
                  <motion.div 
                    className="recommendations-container"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h4 className="scores-title">Similar Inventory Recommendations</h4>
                    <div className="recommendations-grid">
                      {recommendations.map((imgUrl, idx) => (
                        <div key={idx} className="recommendation-card">
                          <img 
                            src={imgUrl} 
                            alt={`${result.class} recommendation ${idx + 1}`} 
                            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x400/e2e8f0/475569?text=${result.class}+Match`; }}
                          />
                          <div className="rec-overlay">
                            <button className="btn btn-primary btn-sm">View Match</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
