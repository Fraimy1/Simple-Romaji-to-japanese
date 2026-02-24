import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function WordSegment({ segment, index, onSelect }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  // Close on outside click / tap
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [open])

  // Show furigana only when the selected form differs from hiragana
  const showFurigana = segment.selected !== segment.hiragana
  const hasMultipleCandidates = segment.candidates.length > 1

  return (
    <div ref={containerRef} className="relative inline-flex flex-col items-center">
      <button
        onClick={() => hasMultipleCandidates && setOpen((o) => !o)}
        className={`
          flex flex-col items-center px-2 py-1.5 rounded-xl
          transition-colors duration-150 select-none
          ${hasMultipleCandidates
            ? 'hover:bg-white/10 active:bg-white/15 cursor-pointer'
            : 'cursor-default'
          }
          ${open ? 'bg-white/10' : ''}
        `}
        aria-haspopup={hasMultipleCandidates ? 'listbox' : undefined}
        aria-expanded={open}
      >
        {/* Main selected text */}
        <span className="text-2xl md:text-3xl leading-tight font-normal">
          {segment.selected}
        </span>

        {/* Furigana / hiragana reading */}
        <span
          className={`
            text-[10px] md:text-xs mt-0.5 leading-tight transition-opacity duration-150
            ${showFurigana ? 'text-white/40' : 'text-transparent'}
          `}
        >
          {segment.hiragana}
        </span>

        {/* Indicator dot for clickable words */}
        {hasMultipleCandidates && (
          <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-white/30" />
        )}
      </button>

      {/* Candidate picker popover */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="
              absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
              bg-zinc-950 border border-white/15 rounded-2xl shadow-2xl
              p-2 min-w-max max-w-xs
            "
            role="listbox"
          >
            <p className="text-[9px] text-white/30 uppercase tracking-widest px-2 pb-1.5 pt-0.5">
              {segment.romaji}
            </p>
            <div className="flex flex-col gap-0.5">
              {segment.candidates.map((candidate) => {
                const isSelected = candidate === segment.selected
                return (
                  <button
                    key={candidate}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onSelect(index, candidate)
                      setOpen(false)
                    }}
                    className={`
                      flex items-center justify-between gap-4
                      px-4 py-2 rounded-xl text-left text-xl
                      transition-colors duration-100
                      ${isSelected
                        ? 'bg-white text-black font-medium'
                        : 'text-white hover:bg-white/10 active:bg-white/15'
                      }
                    `}
                  >
                    <span>{candidate}</span>
                    {isSelected && (
                      <svg
                        className="w-3.5 h-3.5 shrink-0"
                        viewBox="0 0 14 14"
                        fill="currentColor"
                      >
                        <path d="M11.5 3.5 5.5 9.5 2.5 6.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
