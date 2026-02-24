import { motion, AnimatePresence } from 'framer-motion'
import WordSegment from './WordSegment'
import CopyButtons from './CopyButtons'

export default function OutputPanel({ segments, loading, onSelectCandidate }) {
  const isEmpty = !loading && segments.length === 0

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-[10px] text-white/30 uppercase tracking-[0.2em]">
          Output · 日本語
        </span>
        {loading && (
          <span className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="block w-1 h-1 rounded-full bg-white/40"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </span>
        )}
      </div>

      <div
        className="flex flex-wrap gap-x-1 gap-y-3 min-h-[64px] pb-6 border-b border-white/8"
        role="group"
        aria-label="Converted Japanese words"
      >
        <AnimatePresence mode="wait">
          {isEmpty ? (
            <motion.span
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-white/15 text-base md:text-lg leading-relaxed self-center"
            >
              変換結果がここに表示されます…
            </motion.span>
          ) : (
            segments.map((segment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.2 }}
              >
                <WordSegment
                  segment={segment}
                  index={index}
                  onSelect={onSelectCandidate}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {segments.length > 0 && (
        <div className="mt-5">
          <CopyButtons segments={segments} />
        </div>
      )}
    </div>
  )
}
