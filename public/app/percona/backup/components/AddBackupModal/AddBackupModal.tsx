import {
  CheckboxField,
  LoaderButton,
  Modal,
  RadioButtonGroupField,
  TextareaInputField,
  TextInputField,
  validators,
} from '@percona/platform-core';
import React, { FC } from 'react';
import { Field, withTypes } from 'react-final-form';

import { Button, HorizontalGroup, useStyles } from '@grafana/ui';
import { AsyncSelectField } from 'app/percona/shared/components/Form/AsyncSelectField';
import { MultiSelectField } from 'app/percona/shared/components/Form/MultiSelectField';
import { SelectField } from 'app/percona/shared/components/Form/SelectField';
import { Databases, DATABASE_LABELS } from 'app/percona/shared/core';

import {
  DATA_MODEL_OPTIONS,
  DAY_OPTIONS,
  HOUR_OPTIONS,
  MAX_VISIBLE_OPTIONS,
  MINUTE_OPTIONS,
  MONTH_OPTIONS,
  WEEKDAY_OPTIONS,
} from './AddBackupModal.constants';
import { Messages } from './AddBackupModal.messages';
import { AddBackupModalService } from './AddBackupModal.service';
import { getStyles } from './AddBackupModal.styles';
import { AddBackupFormProps, AddBackupModalProps } from './AddBackupModal.types';
import { toFormBackup, isCronFieldDisabled, PERIOD_OPTIONS } from './AddBackupModal.utils';

export const AddBackupModal: FC<AddBackupModalProps> = ({
  backup,
  isVisible,
  scheduleMode = false,
  onClose,
  onBackup,
}) => {
  const styles = useStyles(getStyles);
  const initialValues = toFormBackup(backup);
  const { Form } = withTypes<AddBackupFormProps>();

  const handleSubmit = (values: AddBackupFormProps) => onBackup(values);

  return (
    <Modal title={Messages.getModalTitle(scheduleMode, !!backup)} isVisible={isVisible} onClose={onClose}>
      <Form
        initialValues={initialValues}
        onSubmit={handleSubmit}
        render={({ handleSubmit, valid, pristine, submitting, values }) => (
          <form onSubmit={handleSubmit}>
            <div className={styles.formContainer}>
              <div className={styles.formHalf}>
                <Field name="service" validate={validators.required}>
                  {({ input }) => (
                    <div>
                      <AsyncSelectField
                        label={Messages.serviceName}
                        isSearchable={false}
                        disabled={!!backup}
                        loadOptions={AddBackupModalService.loadServiceOptions}
                        defaultOptions
                        {...input}
                        data-qa="service-select-input"
                      />
                    </div>
                  )}
                </Field>
                <TextInputField
                  name="vendor"
                  label={Messages.vendor}
                  disabled
                  defaultValue={values.service ? DATABASE_LABELS[values.service.value?.vendor as Databases] : ''}
                />
              </div>
              <div className={styles.formHalf}>
                <TextInputField name="backupName" label={Messages.backupName} validators={[validators.required]} />
                <Field name="location" validate={validators.required}>
                  {({ input }) => (
                    <div>
                      <AsyncSelectField
                        label={Messages.location}
                        isSearchable={false}
                        disabled={!!backup}
                        loadOptions={AddBackupModalService.loadLocationOptions}
                        defaultOptions
                        {...input}
                        data-qa="location-select-input"
                      />
                    </div>
                  )}
                </Field>
              </div>
            </div>
            <RadioButtonGroupField
              disabled
              options={DATA_MODEL_OPTIONS}
              name="dataModel"
              label={Messages.dataModel}
              fullWidth
            />
            <TextareaInputField name="description" label={Messages.description} />
            {scheduleMode && (
              <div className={styles.advancedGroup} data-qa="advanced-backup-fields">
                <h6 className={styles.advancedTitle}>Schedule</h6>
                <div>
                  <div className={styles.advancedRow}>
                    <Field name="period" validate={validators.required}>
                      {({ input }) => (
                        <div>
                          <SelectField {...input} options={PERIOD_OPTIONS} label={Messages.every} />
                        </div>
                      )}
                    </Field>
                    <Field name="month">
                      {({ input }) => (
                        <div>
                          <MultiSelectField
                            {...input}
                            closeMenuOnSelect={false}
                            options={MONTH_OPTIONS}
                            label={Messages.month}
                            isClearable
                            placeholder={Messages.every}
                            maxVisibleValues={MAX_VISIBLE_OPTIONS}
                            disabled={isCronFieldDisabled(values.period!.value!, 'month')}
                          />
                        </div>
                      )}
                    </Field>
                  </div>
                  <div className={styles.advancedRow}>
                    <Field name="day">
                      {({ input }) => (
                        <div>
                          <MultiSelectField
                            {...input}
                            closeMenuOnSelect={false}
                            options={DAY_OPTIONS}
                            label={Messages.day}
                            isClearable
                            placeholder={Messages.every}
                            maxVisibleValues={MAX_VISIBLE_OPTIONS}
                            disabled={isCronFieldDisabled(values.period!.value!, 'day')}
                          />
                        </div>
                      )}
                    </Field>
                    <Field name="weekDay">
                      {({ input }) => (
                        <div>
                          <MultiSelectField
                            {...input}
                            closeMenuOnSelect={false}
                            options={WEEKDAY_OPTIONS}
                            label={Messages.weekDay}
                            isClearable
                            placeholder={Messages.every}
                            maxVisibleValues={MAX_VISIBLE_OPTIONS}
                            disabled={isCronFieldDisabled(values.period!.value!, 'weekDay')}
                          />
                        </div>
                      )}
                    </Field>
                  </div>
                  <div className={styles.advancedRow}>
                    <Field name="startHour">
                      {({ input }) => (
                        <div>
                          <MultiSelectField
                            {...input}
                            closeMenuOnSelect={false}
                            options={HOUR_OPTIONS}
                            label={Messages.startTime}
                            isClearable
                            placeholder={Messages.every}
                            maxVisibleValues={MAX_VISIBLE_OPTIONS}
                            disabled={isCronFieldDisabled(values.period!.value!, 'startHour')}
                          />
                        </div>
                      )}
                    </Field>
                    <Field name="startMinute">
                      {({ input }) => (
                        <div>
                          <MultiSelectField
                            {...input}
                            closeMenuOnSelect={false}
                            options={MINUTE_OPTIONS}
                            label="&nbsp;"
                            isClearable
                            placeholder={Messages.every}
                            maxVisibleValues={MAX_VISIBLE_OPTIONS}
                            disabled={isCronFieldDisabled(values.period!.value!, 'startMinute')}
                          />
                        </div>
                      )}
                    </Field>
                  </div>
                  <div className={styles.advancedRow}>
                    <CheckboxField fieldClassName={styles.checkbox} name="active" label={Messages.enabled} />
                  </div>
                </div>
              </div>
            )}
            <HorizontalGroup justify="center" spacing="md">
              <LoaderButton
                data-qa="backup-add-button"
                size="md"
                variant="primary"
                disabled={!valid || pristine}
                loading={submitting}
              >
                {!!backup ? Messages.editAction : scheduleMode ? Messages.scheduleAction : Messages.backupAction}
              </LoaderButton>
              <Button data-qa="storage-location-cancel-button" variant="secondary" onClick={onClose}>
                {Messages.cancelAction}
              </Button>
            </HorizontalGroup>
          </form>
        )}
      />
    </Modal>
  );
};
