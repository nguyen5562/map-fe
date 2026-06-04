import { useRef } from 'react';
import { CalendarDays } from 'lucide-react';

/**
 * Converts "DD.MM.YY" → "YYYY-MM-DD" (for native date input value)
 */
function displayToNative(display: string): string {
  const parts = display.split('.');
  if (parts.length !== 3) return '';
  const [d, m, y] = parts;
  const fullYear = parseInt(y, 10) < 50 ? `20${y}` : `19${y}`;
  return `${fullYear}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

/**
 * Converts "YYYY-MM-DD" → "DD.MM.YY"
 */
function nativeToDisplay(native: string): string {
  const parts = native.split('-');
  if (parts.length !== 3) return '';
  const [y, m, d] = parts;
  return `${d}.${m}.${y.slice(2)}`;
}

interface DatePickerInputProps {
  value: string;           // DD.MM.YY format
  onChange: (val: string) => void;
  placeholder?: string;
}

export const DatePickerInput = ({ value, onChange, placeholder = 'DD.MM.YY' }: DatePickerInputProps) => {
  const hiddenRef = useRef<HTMLInputElement>(null);

  const handleIconClick = () => {
    hiddenRef.current?.showPicker?.();
    hiddenRef.current?.click();
  };

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(nativeToDisplay(e.target.value));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative flex items-center group">
      {/* Text input hiển thị DD.MM.YY */}
      <input
        type="text"
        value={value}
        onChange={handleTextChange}
        placeholder={placeholder}
        maxLength={8}
        className="flex h-9 w-full rounded-md border border-slate-300 bg-white pl-3 pr-10 py-1 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />

      {/* Icon lịch */}
      <button
        type="button"
        onClick={handleIconClick}
        className="absolute right-2 flex items-center justify-center w-6 h-6 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150 focus:outline-none"
        title="Chọn ngày"
      >
        <CalendarDays size={15} />
      </button>

      {/* Native date input ẩn — chỉ dùng để mở picker */}
      <input
        ref={hiddenRef}
        type="date"
        value={displayToNative(value)}
        onChange={handleNativeChange}
        className="absolute opacity-0 w-0 h-0 pointer-events-none"
        tabIndex={-1}
      />
    </div>
  );
};
