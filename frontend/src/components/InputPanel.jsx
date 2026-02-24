export default function InputPanel({ value, onChange }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <label className="block text-[10px] text-white/30 uppercase tracking-[0.2em] mb-4">
        Input · Romaji
      </label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
    </div>
  )
}
