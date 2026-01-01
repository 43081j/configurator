interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface SelectProps<T extends string = string> {
  label: string;
  value: T | 'none';
  onChange: (value: T | 'none') => void;
  options: SelectOption<T>[];
  includeNone?: boolean;
}

export function Select<T extends string = string>({
  label,
  value,
  onChange,
  options,
  includeNone = false
}: SelectProps<T>) {
  const allOptions: Array<SelectOption<T | 'none'>> = includeNone
    ? [{value: 'none', label: 'None'}, ...options]
    : options;

  return (
    <div class="flex flex-col gap-2">
      <label class="text-sm font-semibold text-gray-700">{label}</label>
      <select
        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white"
        value={value}
        onChange={(e) =>
          onChange((e.target as HTMLSelectElement).value as T | 'none')
        }
      >
        {allOptions.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
