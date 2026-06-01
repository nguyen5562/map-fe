export const Input = ({
  value,
  onChange,
  placeholder,
  className = "",
  disabled = false,
}: any) => (
  <input
    type="number"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    className={`flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${className}`}
  />
);
