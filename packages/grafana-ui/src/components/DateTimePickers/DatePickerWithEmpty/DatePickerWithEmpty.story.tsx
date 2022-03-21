import React, { useState } from 'react';
import { DatePickerWithEmpty } from './DatePickerWithEmpty';
import { withCenteredStory } from '../../../utils/storybook/withCenteredStory';
import mdx from './DatePickerWithEmpty.mdx';

export default {
  title: 'Pickers and Editors/TimePickers/DatePickerWithEmpty',
  component: DatePickerWithEmpty,
  decorators: [withCenteredStory],
  parameters: {
    docs: {
      page: mdx,
    },
  },
};

export const Basic = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dateInput, setDateInput] = useState<boolean>(true);

  return (
    <DatePickerWithEmpty
      onClose={() => {}}
      isDateInput={dateInput}
      isOpen={true}
      value={date}
      onChange={(newDate, dateInput) => {
        setDate(newDate);
        setDateInput(dateInput);
      }}
    />
  );
};
