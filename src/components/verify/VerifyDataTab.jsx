import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../../providers/ThemeProvider'
import EEGWaveformViewer from '../EEGWaveformViewer'
import DatasetSplitViewer from '../DatasetSplitViewer'
import { SAMPLE_EEG_DATA } from '../../data/verifyModels'
import { getVerifyColors, cardStyle, sectionAnim } from './verifyStyles'

export default function VerifyDataTab({ model, onPredict }) {
  const { isDark } = useTheme()
  const c = getVerifyColors(isDark)
  const fileInputRef = useRef(null)

  const [sampleData, setSampleData] = useState(model.dataset?.sampleDataAvailable ? SAMPLE_EEG_DATA : null)
  const [showRawValues, setShowRawValues] = useState(false)
  const [uploadData, setUploadData] = useState(null)
  const [uploadError, setUploadError] = useState(null)
  const [uploadResult, setUploadResult] = useState(null)
  const [uploading, setUploading] = useState(false)

  const ds = model.dataset
  if (!ds) {
    return (
      <div style={cardStyle(isDark, { padding: '48px', textAlign: 'center' })}>
        <div style={{ fontSize: '14px', color: c.textSecondary }}>Dataset information is not available for this model.</div>
      </div>
    )
  }

  const handleFileDrop = async (e) => {
    e.preventDefault()
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0]
    if (!file) return
    setUploadError(null)
    setUploadResult(null)

    try {
      const text = await file.text()
      let parsed
      if (file.name.endsWith('.json')) {
        parsed = JSON.parse(text)
      } else if (file.name.endsWith('.csv')) {
        parsed = text.trim().split('\n').map(row => row.split(',').map(Number))
      } else {
        throw new Error('Unsupported format. Use .json or .csv')
      }

      // Validate shape
      if (!Array.isArray(parsed) || parsed.length !== 4 || !parsed.every(ch => Array.isArray(ch) && ch.length === 200)) {
        throw new Error('Data must be [4, 200] shape (4 channels, 200 samples)')
      }
      setUploadData(parsed)
    } catch (err) {
      setUploadError(err.message)
    }
  }

  const handleUploadPredict = async () => {
    if (!uploadData || !onPredict) return
    setUploading(true)
    setUploadResult(null)
    try {
      const res = await onPredict(uploadData)
      setUploadResult(res)
    } catch (e) {
      setUploadError(e.message)
    } finally {
      setUploading(false)
    }
  }

  const downloadJson = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* Dataset Overview */}
      <motion.div {...sectionAnim} style={{ marginBottom: '32px' }}>
        <h3 style={{ color: c.textPrimary, fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Dataset Overview</h3>
        <div style={cardStyle(isDark, { padding: '28px' })}>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {[
              { label: 'Dataset', value: ds.name },
              { label: 'Source', value: ds.source },
              ds.channels && { label: 'Format', value: `${ds.channels}ch x ${ds.windowSize} samples x ${ds.samplingRate}Hz` },
              { label: 'Total Subjects', value: ds.totalSubjects },
              ds.testSamples && { label: 'Test Samples', value: ds.testSamples.toLocaleString() },
            ].filter(Boolean).map((item, i) => (
              <div key={i} style={{ minWidth: '120px' }}>
                <div style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: c.textSecondary, marginBottom: '4px' }}>{item.label}</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary }}>{item.value}</div>
              </div>
            ))}
          </div>

          <DatasetSplitViewer dataset={ds} />
        </div>
      </motion.div>

      {/* Sample Inspector */}
      {sampleData && (
        <motion.div {...sectionAnim} style={{ marginBottom: '32px' }}>
          <h3 style={{ color: c.textPrimary, fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Sample Inspector</h3>
          <div style={cardStyle(isDark, { padding: '28px' })}>
            <div style={{ fontSize: '12px', color: c.textSecondary, marginBottom: '12px' }}>
              Test subject sample — {ds.channelNames?.join(', ')} channels at {ds.samplingRate}Hz ({ds.windowSize} samples = {(ds.windowSize / ds.samplingRate).toFixed(1)}s)
            </div>

            <EEGWaveformViewer
              data={sampleData}
              channelNames={ds.channelNames}
              samplingRate={ds.samplingRate}
              width={700}
              height={280}
            />

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
              <button onClick={() => setShowRawValues(!showRawValues)} style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                background: showRawValues ? c.greenBg : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                border: `1px solid ${showRawValues ? c.greenBorder : c.cardBorder}`,
                color: showRawValues ? c.green : c.textSecondary, cursor: 'pointer',
              }}>
                {showRawValues ? 'Hide Raw Values' : 'Show Raw Values'}
              </button>
              <button onClick={() => downloadJson(sampleData, 'eeg_sample_data.json')} style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${c.cardBorder}`, color: c.textSecondary, cursor: 'pointer',
              }}>Download Sample (JSON)</button>
            </div>

            {showRawValues && (
              <pre style={{
                marginTop: '12px', padding: '12px', borderRadius: '8px',
                background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${c.cardBorder}`, color: c.textPrimary,
                fontSize: '10px', fontFamily: 'monospace', overflow: 'auto',
                maxHeight: '200px', margin: '12px 0 0 0',
              }}>
                {JSON.stringify(sampleData, null, 2)}
              </pre>
            )}
          </div>
        </motion.div>
      )}

      {/* Upload Your Data */}
      {model.endpoints?.predict && (
        <motion.div {...sectionAnim} style={{ marginBottom: '32px' }}>
          <h3 style={{ color: c.textPrimary, fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Upload Your Data</h3>
          <div style={cardStyle(isDark, { padding: '28px' })}>
            {/* Drop zone */}
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '32px', borderRadius: '12px', textAlign: 'center',
                border: `2px dashed ${uploadData ? c.greenBorder : c.cardBorder}`,
                background: uploadData
                  ? (isDark ? 'rgba(16,185,129,0.04)' : 'rgba(16,185,129,0.02)')
                  : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'),
                cursor: 'pointer', marginBottom: '16px',
              }}
            >
              <input ref={fileInputRef} type="file" accept=".json,.csv" onChange={handleFileDrop} style={{ display: 'none' }} />
              {uploadData ? (
                <div>
                  <div style={{ color: c.green, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Data loaded: [4, 200] shape</div>
                  <EEGWaveformViewer data={uploadData} channelNames={ds.channelNames} samplingRate={ds.samplingRate} width={500} height={160} />
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '14px', color: c.textSecondary, marginBottom: '4px' }}>
                    Drop .json or .csv file here (or click to browse)
                  </div>
                  <div style={{ fontSize: '12px', color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)' }}>
                    Must be [4, 200] shape — 4 channels, 200 samples
                  </div>
                </div>
              )}
            </div>

            {uploadError && (
              <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>{uploadError}</div>
            )}

            {uploadData && (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleUploadPredict} disabled={uploading}
                style={{
                  padding: '10px 24px', borderRadius: '10px',
                  background: `linear-gradient(135deg, ${c.green}, #059669)`,
                  border: 'none', color: '#fff', fontSize: '14px', fontWeight: '700',
                  cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1,
                }}
              >
                {uploading ? 'Running...' : 'Run Prediction on Your Data'}
              </motion.button>
            )}

            {uploadResult && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{
                marginTop: '16px', padding: '20px', borderRadius: '10px',
                background: isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.04)',
                border: `1px solid ${c.greenBorder}`, textAlign: 'center',
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: c.textSecondary, marginBottom: '4px' }}>Prediction</div>
                <div style={{ fontSize: '32px', fontWeight: '800', fontFamily: "'JetBrains Mono', monospace", color: c.green }}>
                  {uploadResult.prediction?.toFixed(6)}
                </div>
                <div style={{ fontSize: '12px', color: c.textSecondary, marginTop: '4px' }}>{uploadResult.latency_ms?.toFixed(1)}ms</div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Download Options */}
      <motion.div {...sectionAnim} style={{ marginBottom: '32px' }}>
        <h3 style={{ color: c.textPrimary, fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Download Options</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            sampleData && { label: 'Sample Data (JSON)', size: '~6 KB', onClick: () => downloadJson(sampleData, 'eeg_sample_data.json') },
            { label: 'Split Manifest (JSON)', size: '~1 KB', onClick: () => downloadJson({ train: ds.trainSubjects, val: ds.valSubjects, test: ds.testSubjects, method: ds.splitMethod }, 'split_manifest.json') },
          ].filter(Boolean).map((item, i) => (
            <button key={i} onClick={item.onClick} style={{
              padding: '12px 20px', borderRadius: '10px',
              background: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
              border: `1px solid ${c.cardBorder}`, cursor: 'pointer',
              textAlign: 'left',
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary }}>{item.label}</div>
              <div style={{ fontSize: '12px', color: c.textSecondary }}>{item.size}</div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
