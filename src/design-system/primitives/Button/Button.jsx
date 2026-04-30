import './Button.css';

const VARIANTS = ['primary', 'secondary', 'tertiary', 'link'];
const SIZES = ['default', 'small', 'compact'];

export function Button({
  variant = 'secondary',
  size = 'default',
  disabled = false,
  isBusy = false,
  iconLeft = null,
  iconRight = null,
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  const safeVariant = VARIANTS.includes(variant) ? variant : 'secondary';
  const safeSize = SIZES.includes(size) ? size : 'default';

  const classes = [
    'wpds-button',
    `wpds-button--${safeVariant}`,
    safeSize !== 'default' && `wpds-button--${safeSize}`,
    isBusy && 'wpds-button--busy',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || isBusy}
      aria-busy={isBusy || undefined}
      {...rest}
    >
      {iconLeft && <span className="wpds-button__icon">{iconLeft}</span>}
      <span className="wpds-button__label">{children}</span>
      {iconRight && <span className="wpds-button__icon">{iconRight}</span>}
    </button>
  );
}
