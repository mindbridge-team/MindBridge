import { Input } from '../ui/input';
import { Label } from '../ui/label';

type FormInputFieldProps = {
  id: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'date';
  value: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  inputClassName: string;
  onChange: (value: string) => void;
};

export function FormInputField({
  id,
  label,
  type,
  value,
  placeholder,
  required,
  error,
  inputClassName,
  onChange,
}: FormInputFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm">{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className={`${inputClassName} ${error ? 'border-red-500' : ''}`}
      />
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
