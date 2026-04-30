import { Tooltip } from '@wordpress/components';

/**
 * Inline term with tooltip definition (wiki-style)
 * @param {string} children - The term text
 * @param {string} definition - The definition to show in tooltip
 */
function DefinedTerm({ children, definition }) {
  if (!children) return null;
  
  return (
    <Tooltip text={definition} delay={400}>
      <span className="defined-term">{children}</span>
    </Tooltip>
  );
}

export default DefinedTerm;
