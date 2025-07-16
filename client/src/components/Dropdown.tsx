import { useEffect, useRef, useState } from 'react'

const Dropdown = ({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: {
    value: string
    label: string
    color?: string
    disabled?: boolean
  }[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left bg-white border border-stone-900 text-stone-900 hover:bg-stone-50 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {selectedOption?.color && (
            <div
              className="w-4 h-4 border border-stone-300"
              style={{ backgroundColor: selectedOption.color }}
            />
          )}
          <span>{selectedOption?.label || placeholder}</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-label="Toggle dropdown"
        >
          <title>Toggle dropdown</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border border-stone-900 border-t-0 max-h-60 overflow-y-auto z-10">
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => {
                if (!option.disabled) {
                  onChange(option.value)
                  setIsOpen(false)
                }
              }}
              disabled={option.disabled}
              className={`w-full px-3 py-2 text-left hover:bg-stone-100 flex items-center gap-2 ${
                option.disabled
                  ? 'text-stone-400 cursor-not-allowed'
                  : 'text-stone-900'
              } ${value === option.value ? 'bg-stone-100' : ''}`}
            >
              {option.color && (
                <div
                  className="w-4 h-4 border border-stone-300"
                  style={{ backgroundColor: option.color }}
                />
              )}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dropdown
