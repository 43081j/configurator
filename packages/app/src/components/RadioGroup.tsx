interface RadioOption {
  value: boolean;
  label: string;
}

interface RadioGroupProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function RadioGroup({label, value, onChange}: RadioGroupProps) {
  const options: RadioOption[] = [
    {value: true, label: 'Yes'},
    {value: false, label: 'No'}
  ];

  return (
    <div class="flex flex-col gap-2">
      <label class="text-sm font-semibold text-gray-700">{label}</label>
      <div class="flex gap-4">
        {options.map((option) => (
          <label
            key={String(option.value)}
            class="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer transition"
          >
            <input
              type="radio"
              class="w-4 h-4 cursor-pointer accent-blue-600"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
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
