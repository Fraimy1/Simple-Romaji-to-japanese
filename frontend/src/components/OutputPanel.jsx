import { motion } from 'framer-motion'
import WordSegment from './WordSegment'
import CopyButtons from './CopyButtons'

export default function OutputPanel({ segments, onSelectCandidate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6"
    >
      <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-5">
        Output · 日本語
      </div>

      {/* Word segments in a wrapping flex row */}
      <div
        className="flex flex-wrap gap-x-1 gap-y-3 min-h-[64px] pb-6 border-b border-white/8"
        role="group"
        aria-label="Converted Japanese words"
      >
        {segments.map((segment, index) => (
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
        ))}
      </div>

      <div className="mt-5">
        <CopyButtons segments={segments} />
      </div>
    </motion.div>
  )
}
