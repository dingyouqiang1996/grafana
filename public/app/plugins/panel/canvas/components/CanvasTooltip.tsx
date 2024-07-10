import { css } from '@emotion/css';
import { useDialog } from '@react-aria/dialog';
import { useOverlay } from '@react-aria/overlays';
import { createRef } from 'react';

import { Field, GrafanaTheme2, LinkModel } from '@grafana/data/src';
import { LinkButton, Portal, Stack, useStyles2, VizTooltipContainer } from '@grafana/ui';
import { CloseButton } from 'app/core/components/CloseButton/CloseButton';
import { Scene } from 'app/features/canvas/runtime/scene';

interface Props {
  scene: Scene;
}

export const CanvasTooltip = ({ scene }: Props) => {
  const style = useStyles2(getStyles);

  const onClose = () => {
    if (scene?.tooltipCallback && scene.tooltip) {
      scene.tooltipCallback(undefined);
    }
  };

  const ref = createRef<HTMLElement>();
  const { overlayProps } = useOverlay({ onClose: onClose, isDismissable: true }, ref);
  const { dialogProps } = useDialog({}, ref);

  const element = scene.tooltip?.element;
  if (!element) {
    return <></>;
  }

  const links: Array<LinkModel<Field>> = [];
  const linkLookup = new Set<string>();

  const elementHasLinks = (element.options.links?.length ?? 0) > 0 && element.getLinks;
  if (elementHasLinks) {
    element.getLinks!({}).forEach((link) => {
      const key = `${link.title}/${link.href}`;
      if (!linkLookup.has(key)) {
        links.push(link);
        linkLookup.add(key);
      }
    });
  }

  // sort element data links
  links.sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0));

  const renderDataLinks = () =>
    links.length > 0 && (
      <div>
        <Stack direction={'column'}>
          {links.map((link: LinkModel, i: number) => (
            <LinkButton
              key={i}
              icon={'external-link-alt'}
              target={link.target}
              href={link.href}
              onClick={link.onClick}
              fill="text"
              style={{ width: '100%' }}
            >
              {link.title}
            </LinkButton>
          ))}
        </Stack>
      </div>
    );

  return (
    <>
      {scene.tooltip?.element && scene.tooltip.anchorPoint && (
        <Portal>
          <VizTooltipContainer
            position={{ x: scene.tooltip.anchorPoint.x, y: scene.tooltip.anchorPoint.y }}
            offset={{ x: 5, y: 0 }}
            allowPointerEvents={scene.tooltip.isOpen}
          >
            <section ref={ref} {...overlayProps} {...dialogProps}>
              {scene.tooltip.isOpen && <CloseButton style={{ zIndex: 1 }} onClick={onClose} />}
              <div className={style.wrapper}>{renderDataLinks()}</div>
            </section>
          </VizTooltipContainer>
        </Portal>
      )}
    </>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  wrapper: css({
    marginTop: '20px',
    background: theme.colors.background.primary,
  }),
});
