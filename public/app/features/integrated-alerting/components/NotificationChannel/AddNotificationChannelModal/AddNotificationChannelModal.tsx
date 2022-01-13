import { Modal, LoaderButton, TextInputField, validators, logger } from '@percona/platform-core';
import React, { FC, useContext, useCallback } from 'react';
import { Form, Field } from 'react-final-form';

import { AppEvents } from '@grafana/data';
import { HorizontalGroup, Select, Button, useStyles } from '@grafana/ui';
import { appEvents } from 'app/core/core';

import { NotificationChannelProvider } from '../NotificationChannel.provider';
import { NotificationChannelService } from '../NotificationChannel.service';
import { NotificationChannelRenderProps } from '../NotificationChannel.types';

import { TYPE_OPTIONS, TYPE_FIELDS_COMPONENT } from './AddNotificationChannel.constants';
import { Messages } from './AddNotificationChannelModal.messages';
import { getStyles } from './AddNotificationChannelModal.styles';
import { AddNotificationChannelModalProps } from './AddNotificationChannelModal.types';
import { getInitialValues } from './AddNotificationChannelModal.utils';

const { required } = validators;

export const AddNotificationChannelModal: FC<AddNotificationChannelModalProps> = ({
  isVisible,
  notificationChannel,
  setVisible,
}) => {
  const styles = useStyles(getStyles);
  const initialValues = getInitialValues(notificationChannel);
  const { getNotificationChannels } = useContext(NotificationChannelProvider);
  const onSubmit = async (values: NotificationChannelRenderProps) => {
    try {
      if (notificationChannel) {
        await NotificationChannelService.change(notificationChannel.channelId, values);
      } else {
        await NotificationChannelService.add(values);
      }
      setVisible(false);
      appEvents.emit(AppEvents.alertSuccess, [notificationChannel ? Messages.editSuccess : Messages.addSuccess]);
      getNotificationChannels();
    } catch (e) {
      logger.error(e);
    }
  };
  const renderTypeFields = useCallback((values: NotificationChannelRenderProps) => {
    const TypeFields = TYPE_FIELDS_COMPONENT[values.type.value];

    return <TypeFields values={values} />;
  }, []);

  return (
    <Modal title={Messages.title} isVisible={isVisible} onClose={() => setVisible(false)}>
      <Form
        initialValues={initialValues}
        onSubmit={onSubmit}
        render={({ handleSubmit, valid, pristine, submitting, values }) => (
          <form onSubmit={handleSubmit}>
            <>
              <TextInputField name="name" label={Messages.fields.name} validators={[required]} />
              <Field name="type">
                {({ input }) => (
                  <>
                    <label className={styles.label} data-qa="type-field-label">
                      {Messages.fields.type}
                    </label>
                    <Select className={styles.select} options={TYPE_OPTIONS} {...input} />
                  </>
                )}
              </Field>
              {renderTypeFields(values)}
              <HorizontalGroup justify="center" spacing="md">
                <LoaderButton
                  data-qa="notification-channel-add-button"
                  size="md"
                  variant="primary"
                  disabled={!valid || pristine}
                  loading={submitting}
                >
                  {notificationChannel ? Messages.editAction : Messages.addAction}
                </LoaderButton>
                <Button
                  data-qa="notification-channel-cancel-button"
                  variant="secondary"
                  onClick={() => setVisible(false)}
                >
                  {Messages.cancelAction}
                </Button>
              </HorizontalGroup>
            </>
          </form>
        )}
      />
    </Modal>
  );
};
