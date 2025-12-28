interface CheckboxOption<T extends string = string> {
  value: T;
  label: string;
}

interface CheckboxGroupProps<T extends string = string> {
  label: string;
  value: T[];
  onChange: (value: T[]) => void;
  options: CheckboxOption<T>[];
}

export function CheckboxGroup<T extends string = string>({
  label,
  value,
  onChange,
  options
}: CheckboxGroupProps<T>) {
  const handleToggle = (optionValue: T) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <div class="flex flex-col gap-2">
      <label class="text-sm font-semibold text-gray-700">{label}</label>
      <div class="flex flex-col gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            class="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer transition"
          >
            <input
              type="checkbox"
              class="w-4 h-4 cursor-pointer accent-blue-600"
              checked={value.includes(option.value)}
              onChange={() => handleToggle(option.value)}
            />
            <span class="text-sm text-gray-700 select-none">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
