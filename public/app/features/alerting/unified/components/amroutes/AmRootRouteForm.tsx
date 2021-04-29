import React, { FC, useState } from 'react';
import { css, cx } from '@emotion/css';
import { GrafanaThemeV2 } from '@grafana/data';
import { Button, Collapse, Field, Form, Input, InputControl, Link, MultiSelect, Select, useStyles2 } from '@grafana/ui';
import { AmRouteReceiver, FormAmRoute } from '../../types/amroutes';
import {
  mapMultiSelectValueToStrings,
  mapSelectValueToString,
  optionalPositiveInteger,
  stringToSelectableValue,
  stringsToSelectableValues,
} from '../../utils/amroutes';
import { timeOptions } from '../../utils/time';
import { makeAMLink } from '../../utils/misc';

export interface AmRootRouteFormProps {
  onCancel: () => void;
  onSave: (data: FormAmRoute) => void;
  receivers: AmRouteReceiver[];
  routes: FormAmRoute;
  alertManagerSourceName: string;
}

export const AmRootRouteForm: FC<AmRootRouteFormProps> = ({
  onCancel,
  onSave,
  receivers,
  routes,
  alertManagerSourceName,
}) => {
  const styles = useStyles2(getStyles);
  const [isTimingOptionsExpanded, setIsTimingOptionsExpanded] = useState(false);
  const [groupByOptions, setGroupByOptions] = useState(stringsToSelectableValues(routes.groupBy));

  return (
    <Form defaultValues={routes} onSubmit={onSave}>
      {({ control, getValues }) => (
        <>
          <Field label="Default contact point">
            <div className={styles.container}>
              <InputControl
                as={Select}
                className={styles.input}
                control={control}
                name="receiver"
                onChange={mapSelectValueToString}
                options={receivers}
              />
              <span>or</span>
              <Link href={makeAMLink('/alerting/notifications/receivers/new', alertManagerSourceName)}>
                Create a contact point
              </Link>
            </div>
          </Field>
          <Field label="Group by" description="Group alerts when you receive a notification based on labels.">
            <InputControl
              allowCustomValue
              as={MultiSelect}
              className={styles.input}
              control={control}
              name="groupBy"
              onChange={mapMultiSelectValueToStrings}
              onCreateOption={(opt: string) => {
                setGroupByOptions((opts) => [...opts, stringToSelectableValue(opt)]);

                control.setValue('groupBy', [...getValues().groupBy, opt]);
              }}
              options={groupByOptions}
            />
          </Field>
          <Collapse
            collapsible
            isOpen={isTimingOptionsExpanded}
            label="Timing options"
            onToggle={setIsTimingOptionsExpanded}
          >
            <Field
              label="Group wait"
              description="The waiting time until the initial notification is sent for a new group created by an incoming alert."
            >
              <div className={cx(styles.container, styles.timingContainer)}>
                <InputControl
                  as={Input}
                  className={styles.smallInput}
                  control={control}
                  name="groupWaitValue"
                  rules={{
                    validate: optionalPositiveInteger,
                  }}
                />
                <InputControl
                  as={Select}
                  className={styles.input}
                  control={control}
                  name="groupWaitValueType"
                  onChange={mapSelectValueToString}
                  options={timeOptions}
                />
              </div>
            </Field>
            <Field
              label="Group interval"
              description="The waiting time to send a batch of new alerts for that group after the first notification was sent."
            >
              <div className={cx(styles.container, styles.timingContainer)}>
                <InputControl
                  as={Input}
                  className={styles.smallInput}
                  control={control}
                  name="groupIntervalValue"
                  rules={{
                    validate: optionalPositiveInteger,
                  }}
                />
                <InputControl
                  as={Select}
                  className={styles.input}
                  control={control}
                  name="groupIntervalValueType"
                  onChange={mapSelectValueToString}
                  options={timeOptions}
                />
              </div>
            </Field>
            <Field
              label="Repeat interval"
              description="The waiting time to resend an alert after they have successfully been sent."
            >
              <div className={cx(styles.container, styles.timingContainer)}>
                <InputControl
                  as={Input}
                  className={styles.smallInput}
                  control={control}
                  name="repeatIntervalValue"
                  rules={{
                    validate: optionalPositiveInteger,
                  }}
                />
                <InputControl
                  as={Select}
                  className={styles.input}
                  control={control}
                  menuPlacement="top"
                  name="repeatIntervalValueType"
                  onChange={mapSelectValueToString}
                  options={timeOptions}
                />
              </div>
            </Field>
          </Collapse>
          <div className={styles.container}>
            <Button type="submit">Save</Button>
            <Button onClick={onCancel} type="reset" variant="secondary">
              Cancel
            </Button>
          </div>
        </>
      )}
    </Form>
  );
};

const getStyles = (theme: GrafanaThemeV2) => {
  return {
    container: css`
      align-items: center;
      display: flex;
      flex-flow: row nowrap;

      & > * + * {
        margin-left: ${theme.spacing(1)};
      }
    `,
    input: css`
      flex: 1;
    `,
    timingContainer: css`
      max-width: ${theme.spacing(33)};
    `,
    smallInput: css`
      width: ${theme.spacing(6.5)};
    `,
  };
};
