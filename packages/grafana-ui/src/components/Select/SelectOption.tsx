import React, { forwardRef } from 'react';

// Ignoring because I couldn't get @types/react-select work wih Torkel's fork
// @ts-ignore
import { components } from '@torkelo/react-select';
import { OptionProps } from 'react-select';

// https://github.com/JedWatson/react-select/issues/3038
export interface ExtendedOptionProps extends OptionProps<any> {
  data: {
    description?: string;
    imgUrl?: string;
  };
}

export const SelectOption = forwardRef((props: ExtendedOptionProps, ref) => {
  const { children, isSelected, data } = props;
  return (
    <components.Option {...props} innerRef={ref}>
      <div className="gf-form-select-box__desc-option">
        {data.imgUrl && <img className="gf-form-select-box__desc-option__img" src={data.imgUrl} />}
        <div className="gf-form-select-box__desc-option__body">
          <div>{children}</div>
          {data.description && <div className="gf-form-select-box__desc-option__desc">{data.description}</div>}
        </div>
        {isSelected && <i className="fa fa-check" aria-hidden="true" />}
      </div>
    </components.Option>
  );
});

export default SelectOption;
