import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function CopyIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="5" width="8" height="9" rx="1.5"/>
      <path d="M3 11V3a1 1 0 0 1 1-1h8"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.5 6.5 12 13 5"/>
    </svg>
  )
}

export default function CopyButtons({ segments }) {
  const [copied, setCopied] = useState(null)

  const copy = (text, label) => {
    const fallback = () => {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0'
      document.body.appendChild(ta)
      ta.focus(); ta.select()
      try { document.execCommand('copy'); setCopied(label) } catch {}
      finally { document.body.removeChild(ta) }
      setTimeout(() => setCopied(null), 2000)
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => { setCopied(label); setTimeout(() => setCopied(null), 2000) })
        .catch(fallback)
    } else {
      fallback()
    }
  }

  const allSelected   = segments.map((s) => s.selected).join('')
  const allHiragana   = segments.map((s) => s.hiragana).join('')
  const allKatakana   = segments.map((s) => s.katakana).join('')

  const buttons = [
    {
      label: 'Copy All',
      sub: '漢',
      text: allSelected,
      description: 'kanji / selected forms',
    },
    {
      label: 'Copy Hiragana',
      sub: 'あ',
      text: allHiragana,
      description: 'ひらがな',
    },
    {
      label: 'Copy Katakana',
      sub: 'ア',
      text: allKatakana,
      description: 'カタカナ',
    },
  ]

  return (
    <div className="flex flex-wrap gap-2.5 mt-2 relative">
      {buttons.map(({ label, sub, text, description }) => {
        const isCopied = copied === label
        return (
          <motion.button
            key={label}
            onClick={() => copy(text, label)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`
              flex items-center gap-2 pl-3 pr-4 py-2 rounded-xl text-sm
              border transition-all duration-200 group
              ${isCopied
                ? 'bg-white text-black border-white'
                : 'border-white/15 hover:border-white/40 hover:bg-white/5 active:bg-white/10'
              }
            `}
          >
            {/* Japanese character badge */}
            <span className={`
              text-base leading-none font-medium w-5 text-center
              ${isCopied ? 'text-black' : 'text-white/60 group-hover:text-white'}
              transition-colors
            `}>
              {sub}
            </span>

            <span className={`transition-colors ${isCopied ? 'text-black' : 'text-white'}`}>
              {isCopied ? 'Copied!' : label}
            </span>

            <span className={`transition-colors ${isCopied ? 'text-black' : ''}`}>
              {isCopied ? <CheckIcon /> : <CopyIcon />}
            </span>
          </motion.button>
        )
      })}

      {/* Preview of what will be copied – subtle, below buttons */}
      <div className="w-full mt-1">
        <p className="text-[11px] text-white/20 truncate">
          {allSelected}
        </p>
      </div>
    </div>
  )
}
