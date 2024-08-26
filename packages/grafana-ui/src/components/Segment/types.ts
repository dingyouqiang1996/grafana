import { ReactElement } from 'react';

export interface SegmentProps {
  Component?: ReactElement;
  className?: string;
  allowCustomValue?: boolean;
  allowCreateWhileLoading?: boolean;
  createOptionPosition?: 'first' | 'last';
  placeholder?: string;
  disabled?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  autofocus?: boolean;
  allowEmptyValue?: boolean;
  inputPlaceholder?: string;
}
