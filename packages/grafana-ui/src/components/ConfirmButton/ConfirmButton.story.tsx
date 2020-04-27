export { ClipboardButton } from '../ClipboardButton/ClipboardButton';
import React from 'react';
import { storiesOf } from '@storybook/react';
import { text, boolean, select } from '@storybook/addon-knobs';
import { ConfirmButton } from './ConfirmButton';
import { withCenteredStory } from '../../utils/storybook/withCenteredStory';
import { action } from '@storybook/addon-actions';
import { Button } from '../Button';

const getKnobs = () => {
  return {
    buttonText: text('Button text', 'Edit'),
    confirmText: text('Confirm text', 'Save'),
    size: select('Size', ['sm', 'md', 'lg'], 'md'),
    confirmVariant: select(
      'Confirm variant',
      {
        primary: 'primary',
        secondary: 'secondary',
        destructive: 'destructive',
        link: 'link',
      },
      'primary'
    ),
    disabled: boolean('Disabled', false),
    closeOnConfirm: boolean('Close on confirm', true),
  };
};

storiesOf('Buttons/ConfirmButton', module)
  .addDecorator(withCenteredStory)
  .add('default', () => {
    const { size, buttonText, confirmText, confirmVariant, disabled, closeOnConfirm } = getKnobs();
    return (
      <>
        <div className="gf-form-group">
          <div className="gf-form">
            <ConfirmButton
              closeOnConfirm={closeOnConfirm}
              size={size}
              confirmText={confirmText}
              disabled={disabled}
              confirmVariant={confirmVariant}
              onConfirm={() => {
                action('Saved')('save!');
              }}
            >
              {buttonText}
            </ConfirmButton>
          </div>
        </div>
      </>
    );
  })
  .add('with custom button', () => {
    const { buttonText, confirmText, confirmVariant, disabled, size, closeOnConfirm } = getKnobs();
    return (
      <>
        <div className="gf-form-group">
          <div className="gf-form">
            <ConfirmButton
              closeOnConfirm={closeOnConfirm}
              size={size}
              confirmText={confirmText}
              disabled={disabled}
              confirmVariant={confirmVariant}
              onConfirm={() => {
                action('Saved')('save!');
              }}
            >
              <Button size={size} variant="secondary" icon="pen">
                {buttonText}
              </Button>
            </ConfirmButton>
          </div>
        </div>
      </>
    );
  });
