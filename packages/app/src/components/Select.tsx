interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  includeNone?: boolean;
}

export function Select({
  label,
  value,
  onChange,
  options,
  includeNone = false
}: SelectProps) {
  const allOptions = includeNone
    ? [{value: 'none', label: 'None'}, ...options]
    : options;

  return (
    <div class="flex flex-col gap-2">
      <label class="text-sm font-semibold text-gray-700">{label}</label>
      <select
        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white"
        value={value}
        onChange={(e) => onChange((e.target as HTMLSelectElement).value)}
      >
        {allOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
