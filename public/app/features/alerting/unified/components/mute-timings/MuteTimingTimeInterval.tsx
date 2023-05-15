import { css, cx } from '@emotion/css';
import React, { useEffect, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { GrafanaTheme2 } from '@grafana/data';
import { Button, Field, FieldSet, Input, useStyles2 } from '@grafana/ui';

import { MuteTimingFields } from '../../types/mute-timing-form';
import { DAYS_OF_THE_WEEK, defaultTimeInterval, MONTHS, validateArrayField } from '../../utils/mute-timings';

import { Stack } from '@grafana/experimental';
import { concat, uniq, upperFirst, without } from 'lodash';
import { MuteTimingTimeRange } from './MuteTimingTimeRange';

export const MuteTimingTimeInterval = () => {
  const styles = useStyles2(getStyles);
  const { formState, register, setValue } = useFormContext();
  const {
    fields: timeIntervals,
    append: addTimeInterval,
    remove: removeTimeInterval,
  } = useFieldArray<MuteTimingFields>({
    name: 'time_intervals',
  });

  return (
    <FieldSet label="Time intervals">
      <>
        <p>
          A time interval is a definition for a moment in time. All fields are lists, and at least one list element must
          be satisfied to match the field. If a field is left blank, any moment of time will match the field. For an
          instant of time to match a complete time interval, all fields must match. A mute timing can contain multiple
          time intervals.
        </p>
        <Stack direction='column' gap={2}>
          {timeIntervals.map((timeInterval, timeIntervalIndex) => {
            const errors = formState.errors;

            return (
              <div key={timeInterval.id} className={styles.timeIntervalSection}>
                <MuteTimingTimeRange intervalIndex={timeIntervalIndex} />
                <Field label="Days of the week">
                  <DaysOfTheWeek
                    onChange={daysOfWeek => {
                      setValue(`time_intervals.${timeIntervalIndex}.weekdays`, daysOfWeek)
                    }}
                    // @ts-ignore react-hook-form doesn't handle nested field arrays well
                    defaultValue={timeInterval.weekdays}
                  />
                </Field>
                <Field
                  label="Days of the month"
                  description="The days of the month, 1-31, of a month. Negative values can be used to represent days which begin at the end of the month"
                  invalid={!!errors.time_intervals?.[timeIntervalIndex]?.days_of_month}
                  error={errors.time_intervals?.[timeIntervalIndex]?.days_of_month?.message}
                >
                  <Input
                    {...register(`time_intervals.${timeIntervalIndex}.days_of_month`, {
                      validate: (value) =>
                        validateArrayField(
                          value,
                          (day) => {
                            const parsedDay = parseInt(day, 10);
                            return (parsedDay > -31 && parsedDay < 0) || (parsedDay > 0 && parsedDay < 32);
                          },
                          'Invalid day'
                        ),
                    })}
                    className={styles.input}
                    // @ts-ignore react-hook-form doesn't handle nested field arrays well
                    defaultValue={timeInterval.days_of_month}
                    placeholder="Example: 1, 14:16, -1"
                    data-testid="mute-timing-days"
                  />
                </Field>
                <Field
                  label="Months"
                  description="The months of the year in either numerical or the full calendar month"
                  invalid={!!errors.time_intervals?.[timeIntervalIndex]?.months}
                  error={errors.time_intervals?.[timeIntervalIndex]?.months?.message}
                >
                  <Input
                    {...register(`time_intervals.${timeIntervalIndex}.months`, {
                      validate: (value) =>
                        validateArrayField(
                          value,
                          (month) => MONTHS.includes(month) || (parseInt(month, 10) < 13 && parseInt(month, 10) > 0),
                          'Invalid month'
                        ),
                    })}
                    className={styles.input}
                    placeholder="Example: 1:3, may:august, december"
                    // @ts-ignore react-hook-form doesn't handle nested field arrays well
                    defaultValue={timeInterval.months}
                    data-testid="mute-timing-months"
                  />
                </Field>
                <Field
                  label="Years"
                  invalid={!!errors.time_intervals?.[timeIntervalIndex]?.years}
                  error={errors.time_intervals?.[timeIntervalIndex]?.years?.message ?? ''}
                >
                  <Input
                    {...register(`time_intervals.${timeIntervalIndex}.years`, {
                      validate: (value) => validateArrayField(value, (year) => /^\d{4}$/.test(year), 'Invalid year'),
                    })}
                    className={styles.input}
                    placeholder="Example: 2021:2022, 2030"
                    // @ts-ignore react-hook-form doesn't handle nested field arrays well
                    defaultValue={timeInterval.years}
                    data-testid="mute-timing-years"
                  />
                </Field>
                <Button
                  type="button"
                  variant="destructive"
                  fill='outline'
                  icon="trash-alt"
                  onClick={() => removeTimeInterval(timeIntervalIndex)}
                >
                  Remove time interval
                </Button>
              </div>
            );
          }
          )}
        </Stack>
        <Button
          type="button"
          variant="secondary"
          className={styles.removeTimeIntervalButton}
          onClick={() => {
            addTimeInterval(defaultTimeInterval);
          }}
          icon="plus"
        >
          Add another time interval
        </Button>
      </>
    </FieldSet>
  );
};

interface DaysOfTheWeekProps {
  defaultValue?: string
  onChange: (input: string) => void
}

const parseDays = (input: string): string[] => {
  const parsedDays = input
    .split(",")
    .map(day => day.trim())
    // each "day" could still be a range of days, so we parse the range
    .flatMap(day => day.includes(':') ? parseWeekdayRange(day) : day)
    .map(day => day.toLowerCase())
    // remove invalid weekdays
    .filter(day => DAYS_OF_THE_WEEK.includes(day))

  return uniq(parsedDays)
}

// parse monday:wednesday to ["monday", "tuesday", "wednesday"]
function parseWeekdayRange(input: string): string[] {
  const [start = '', end = ''] = input.split(':')

  const startIndex = DAYS_OF_THE_WEEK.indexOf(start)
  const endIndex = DAYS_OF_THE_WEEK.indexOf(end)

  return DAYS_OF_THE_WEEK.slice(startIndex, endIndex + 1)
}

const DaysOfTheWeek = ({ defaultValue = '', onChange }: DaysOfTheWeekProps) => {
  const styles = useStyles2(getStyles);
  const defaultValues = parseDays(defaultValue);
  const [selectedDays, setSelectedDays] = useState<string[]>(defaultValues);

  const toggleDay = (day: string) => {
    selectedDays.includes(day)
      ? setSelectedDays(selectedDays => without(selectedDays, day))
      : setSelectedDays(selectedDays => concat(selectedDays, day))
  }

  useEffect(() => {
    onChange(selectedDays.join(', '))
  }, [selectedDays]);

  return (
    <div data-testid="mute-timing-weekdays">
      <Stack gap={1}>
        {DAYS_OF_THE_WEEK.map(day => {
          const style = cx(styles.dayOfTheWeek, selectedDays.includes(day) && 'selected')
          const abbreviated = day.slice(0, 3);

          return (
            <button type="button" key={day} className={style} onClick={() => toggleDay(day)}>
              {upperFirst(abbreviated)}
            </button>
          )
        })}
      </Stack>
    </div>
  )
}

const getStyles = (theme: GrafanaTheme2) => ({
  input: css`
    width: 400px;
  `,
  timeIntervalSection: css`
    background-color: ${theme.colors.background.secondary};
    padding: ${theme.spacing(2)};
  `,
  removeTimeIntervalButton: css`
    margin-top: ${theme.spacing(2)};
  `,
  dayOfTheWeek: css`
    cursor: pointer;
    user-select: none;
    padding: ${theme.spacing(1)} ${theme.spacing(3)};

    border: solid 1px ${theme.colors.border.medium};
    background: none;
    border-radius: ${theme.shape.borderRadius()};

    color: ${theme.colors.text.secondary};

    &.selected {
      font-weight: ${theme.typography.fontWeightBold};
      color: ${theme.colors.primary.text};
      border-color: ${theme.colors.primary.border};
      background: ${theme.colors.primary.transparent};
    }
  `
});
