import { Button } from '@wordpress/components';
import { showPrototypeNotImplementedAlert } from '../../utils/prototypeNotImplemented';

function PrototypeNotImplementedButton({ children, onClick, ...props }) {
  const handleClick = (event) => {
    onClick?.(event);
    if (!event.defaultPrevented) {
      showPrototypeNotImplementedAlert();
    }
  };

  return (
    <Button {...props} onClick={handleClick}>
      {children}
    </Button>
  );
}

export default PrototypeNotImplementedButton;
