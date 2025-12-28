interface TagInputProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function TagInput({label, value, onChange, placeholder}: TagInputProps) {
  const handleKeyDown = (e: KeyboardEvent) => {
    const input = e.currentTarget as HTMLInputElement;
    const currentValue = input.value.trim();

    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      if (currentValue && !value.includes(currentValue)) {
        onChange([...value, currentValue]);
        input.value = '';
      }
    } else if (e.key === 'Backspace' && !input.value && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleInput = (e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    const newValue = input.value;

    if (newValue.includes(',')) {
      const parts = newValue
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const newTags = parts.filter((tag) => !value.includes(tag));
      if (newTags.length > 0) {
        onChange([...value, ...newTags]);
      }
      input.value = '';
    }
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div class="flex flex-col gap-2">
      <label class="text-sm font-semibold text-gray-700">{label}</label>
      <div class="min-h-10 px-3 py-2 border border-gray-300 rounded-md focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition flex flex-wrap gap-2 items-center">
        {value.map((tag, index) => (
          <span
            key={index}
            class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200 transition"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(index)}
              class="text-blue-600 hover:text-blue-800 font-bold leading-none"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          class="flex-1 min-w-32 outline-none text-sm"
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
        />
      </div>
    </div>
  );
}
