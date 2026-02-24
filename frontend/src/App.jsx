import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import InputPanel from './components/InputPanel'
import OutputPanel from './components/OutputPanel'
import axios from 'axios'

export default function App() {
  const [inputText, setInputText] = useState('')
  const [segments, setSegments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!inputText.trim()) {
      setSegments([])
      setError(null)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await axios.post('/api/convert', { text: inputText })
        setSegments(response.data.segments)
      } catch (err) {
        setError(
          err.response?.data?.detail ||
          'Conversion failed. Make sure the backend is running.'
        )
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => clearTimeout(debounceRef.current)
  }, [inputText])

  const handleSelectCandidate = (index, candidate) => {
    setSegments((prev) =>
      prev.map((seg, i) => (i === index ? { ...seg, selected: candidate } : seg))
    )
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      {/* ── Header ── */}
      <header className="border-b border-white/10 px-5 py-5 shrink-0">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl md:text-2xl font-bold tracking-widest">
            ロマ字{' '}
            <span className="text-white/30 font-light">→</span>{' '}
            日本語
          </h1>
          <p className="text-white/35 text-xs mt-1 tracking-wider">
            ROMAJI TO JAPANESE CONVERTER
          </p>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 space-y-5">
        <InputPanel
          value={inputText}
          onChange={setInputText}
        />

        <AnimatePresence>
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-400 text-sm border border-red-500/30 rounded-xl px-4 py-3 bg-red-500/5"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <OutputPanel
          segments={segments}
          loading={loading}
          onSelectCandidate={handleSelectCandidate}
        />
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 px-5 py-3 shrink-0">
        <p className="text-white/20 text-xs text-center tracking-widest">
          tap any word to choose kanji · ローマ字変換
        </p>
      </footer>
    </div>
  )
}
