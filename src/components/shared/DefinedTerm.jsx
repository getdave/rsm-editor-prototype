import { Link } from 'react-router-dom';
import { Tooltip } from '@wordpress/components';

/**
 * Inline term with tooltip definition (wiki-style)
 * @param {string} children - The term text
 * @param {string} definition - The definition to show in tooltip
 */
function DefinedTerm({ children, definition, linkTo, linkText, onLinkClick }) {
  if (!children) return null;

  if (linkTo && linkText) {
    return (
      <span className="defined-term-wrap">
        <span className="defined-term">{children}</span>
        <span className="defined-term-popover" role="tooltip">
          <span>{definition}</span>
          <Link to={linkTo} onClick={onLinkClick}>
            {linkText}
          </Link>
        </span>
      </span>
    );
  }
  
  return (
    <Tooltip text={definition} delay={400}>
      <span className="defined-term">{children}</span>
    </Tooltip>
  );
}

export default DefinedTerm;
