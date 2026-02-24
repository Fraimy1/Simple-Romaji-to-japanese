import { motion } from 'framer-motion'

export default function InputPanel({ value, onChange, onConvert, loading }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      onConvert()
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <label className="block text-[10px] text-white/30 uppercase tracking-[0.2em] mb-4">
        Input · Romaji
      </label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="watashi wa gakusei desu..."
        rows={4}
        className="
          w-full bg-transparent text-white placeholder-white/20
          text-base md:text-lg resize-none outline-none border-none
          leading-relaxed
        "
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
      />

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/8">
        <span className="text-white/20 text-xs hidden sm:block">
          Ctrl + Enter to convert
        </span>
        <motion.button
          onClick={onConvert}
          disabled={loading || !value.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          className="
            ml-auto px-6 py-2.5 rounded-xl font-medium text-sm
            bg-white text-black
            disabled:opacity-25 disabled:cursor-not-allowed
            hover:bg-white/90 active:bg-white/80
            transition-colors duration-150
            min-w-[130px] text-center
          "
        >
          {loading ? '変換中…' : '変換 · Convert'}
        </motion.button>
      </div>
    </div>
  )
}
