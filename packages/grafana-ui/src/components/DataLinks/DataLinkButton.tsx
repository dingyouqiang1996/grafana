import { ActionModel, Field, LinkModel } from '@grafana/data';

import { ButtonProps, Button } from '../Button';

type DataLinkButtonProps = {
  link: LinkModel<Field>;
  buttonProps?: ButtonProps;
};

/**
 * @internal
 */
export function DataLinkButton({ link, buttonProps }: DataLinkButtonProps) {
  return (
    <a
      href={link.href}
      target={link.target}
      rel="noreferrer"
      onClick={
        link.onClick
          ? (event) => {
              if (!(event.ctrlKey || event.metaKey || event.shiftKey) && link.onClick) {
                event.preventDefault();
                link.onClick(event);
              }
            }
          : undefined
      }
    >
      <Button
        icon={link.target === '_blank' ? 'external-link-alt' : undefined}
        variant="primary"
        size="sm"
        {...buttonProps}
      >
        {link.title}
      </Button>
    </a>
  );
}

type ActionButtonProps = {
  action: ActionModel<Field>;
  buttonProps?: ButtonProps;
};

/**
 * @internal
 */
export function ActionButton({ action, buttonProps }: ActionButtonProps) {
  return (
    <Button icon="external-link-alt" variant="primary" size="sm" onClick={action.onClick} {...buttonProps}>
      {action.title}
    </Button>
  );
}
