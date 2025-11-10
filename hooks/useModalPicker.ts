// External Imports
import { useState } from 'react';

// Internal Imports

type Option = { label: string; value: string };

export function useModalPicker(onSelect: (value: string) => void) {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);

  const open = (newOptions: Option[]) => {
    setOptions(newOptions);
    setVisible(true);
  };

  const close = () => setVisible(false);

  const isfinished = () => {
    setVisible(false);
  };

  const compare = (a: Option, b: Option) => {
    if (a.label < b.label) {
      return -1;
    }
  };

  const select = (value: string) => {
    onSelect(value);
    close();
  };

  return {
    visible,
    options,
    open,
    close,
    select,
  };
}
