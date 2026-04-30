import { useId } from 'react';
import './TextControl.css';

export function TextControl({
  label,
  help,
  error,
  value,
  onChange,
  placeholder = '',
  disabled = false,
  type = 'text',
  id,
  className = '',
  inputProps = {},
  ...rest
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const helpId = help ? `${inputId}-help` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined;

  const wrapperClasses = [
    'wpds-text-control',
    error && 'wpds-text-control--error',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClasses} {...rest}>
      {label && (
        <label className="wpds-text-control__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className="wpds-text-control__input"
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value, e)}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="wpds-text-control__error">
          {error}
        </p>
      )}
      {!error && help && (
        <p id={helpId} className="wpds-text-control__help">
          {help}
        </p>
      )}
    </div>
  );
}
