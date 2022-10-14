import React, { FC } from 'react';

import { SelectableValue } from '@grafana/data';
import { Select, Field } from '@grafana/ui';

export interface AlertLabelDropdownProps {
  onChange: (newValue: SelectableValue<string>) => void;
  options: SelectableValue[];
  defaultValue?: SelectableValue;
  type: 'key' | 'value';
}

const AlertLabelDropdown: FC<AlertLabelDropdownProps> = React.forwardRef(function labelPicker(
  { onChange, options, defaultValue, type },
  ref
) {
  return (
    <Field disabled={false} data-testid={`alertlabel-${type}-picker`}>
      <Select
        placeholder={'Choose key'}
        width={29}
        className="ds-picker select-container"
        backspaceRemovesValue={false}
        onChange={onChange}
        options={options}
        maxMenuHeight={500}
        noOptionsMessage="No labels found"
        defaultValue={defaultValue}
        allowCustomValue
      />
    </Field>
  );
});

export default AlertLabelDropdown;
