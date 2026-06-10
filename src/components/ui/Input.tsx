export const Input = ({
  value,
  onChange,
  placeholder,
  className = "",
  disabled = false,
  type = "text",
  ...props
}: any) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    className={`flex h-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${className}`}
    {...props}
  />
);

