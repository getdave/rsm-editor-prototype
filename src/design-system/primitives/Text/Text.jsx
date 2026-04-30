import './Text.css';

const VARIANTS = ['xSmall', 'small', 'body', 'large', 'xLarge', '2xLarge'];
const WEIGHTS = ['regular', 'medium'];

export function Text({
  variant = 'body',
  weight = 'regular',
  muted = false,
  as: Tag = 'span',
  className = '',
  children,
  ...rest
}) {
  const safeVariant = VARIANTS.includes(variant) ? variant : 'body';
  const safeWeight = WEIGHTS.includes(weight) ? weight : 'regular';

  const classes = [
    'wpds-text',
    `wpds-text--${safeVariant}`,
    `wpds-text--${safeWeight}`,
    muted && 'wpds-text--muted',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}
