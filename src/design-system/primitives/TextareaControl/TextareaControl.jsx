import { useId } from 'react';
import './TextareaControl.css';

export function TextareaControl({
  label,
  help,
  error,
  value,
  onChange,
  placeholder = '',
  disabled = false,
  rows = 4,
  id,
  className = '',
  textareaProps = {},
  ...rest
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const helpId = help ? `${inputId}-help` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined;

  const wrapperClasses = [
    'wpds-textarea-control',
    error && 'wpds-textarea-control--error',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClasses} {...rest}>
      {label && (
        <label className="wpds-textarea-control__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className="wpds-textarea-control__input"
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value, e)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        {...textareaProps}
      />
      {error && (
        <p id={errorId} className="wpds-textarea-control__error">
          {error}
        </p>
      )}
      {!error && help && (
        <p id={helpId} className="wpds-textarea-control__help">
          {help}
        </p>
      )}
    </div>
  );
}
