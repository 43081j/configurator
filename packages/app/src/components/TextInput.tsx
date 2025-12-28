interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder
}: TextInputProps) {
  return (
    <div class="flex flex-col gap-2">
      <label class="text-sm font-semibold text-gray-700">{label}</label>
      <input
        type="text"
        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
        value={value}
        onInput={(e) => onChange((e.target as HTMLInputElement).value)}
        placeholder={placeholder}
      />
    </div>
  );
}
