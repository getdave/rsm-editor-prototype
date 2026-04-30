import { useId } from 'react';
import './Checkbox.css';

export function Checkbox({
  label,
  checked = false,
  onChange,
  disabled = false,
  id,
  className = '',
  ...rest
}) {
  const generatedId = useId();
  const inputId = id || generatedId;

  const wrapperClasses = [
    'wpds-checkbox',
    disabled && 'wpds-checkbox--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={wrapperClasses} htmlFor={inputId}>
      <input
        id={inputId}
        type="checkbox"
        className="wpds-checkbox__input"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked, e)}
        disabled={disabled}
        {...rest}
      />
      {label && <span className="wpds-checkbox__label">{label}</span>}
    </label>
  );
}
