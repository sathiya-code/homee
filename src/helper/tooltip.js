import {Tooltip} from '@rneui/base';
import {useState} from 'react';

export const ControlledTooltip = props => {
  const [open, setOpen] = useState(false);
  return (
    <Tooltip
      backgroundColor={'#B78C8C'}
      visible={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      {...props}
      skipAndroidStatusBar
    />
  );
};
