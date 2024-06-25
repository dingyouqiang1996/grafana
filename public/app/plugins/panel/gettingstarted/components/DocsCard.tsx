import { css } from '@emotion/css';

import { GrafanaTheme2 } from '@grafana/data';
import { reportInteraction } from '@grafana/runtime';
import { Icon, useStyles2 } from '@grafana/ui';

import { Card } from '../types';

import { cardContent, cardStyle } from './sharedStyles';

interface Props {
  card: Card;
}

export const DocsCard = ({ card }: Props) => {
  const styles = useStyles2(getStyles, card.done);

  return (
    <div className={styles.card}>
      <div className={cardContent}>
        <a
          href={`${card.href}?utm_source=grafana_gettingstarted`}
          className={styles.url}
          onClick={() => reportInteraction('grafana_getting_started_docs', { title: card.title, link: card.href })}
        >
          <div className={styles.heading}>{card.done ? 'complete' : card.heading}</div>
          <h4 className={styles.title}>{card.title}</h4>
        </a>
      </div>
      <a
        href={`${card.learnHref}?utm_source=grafana_gettingstarted`}
        className={styles.learnUrl}
        target="_blank"
        rel="noreferrer"
        onClick={() => reportInteraction('grafana_getting_started_docs', { title: card.title, link: card.learnHref })}
      >
        Learn how in the docs <Icon name="external-link-alt" />
      </a>
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2, complete: boolean) => {
  return {
    card: css`
      ${cardStyle(theme, complete)}

      min-width: 230px;

      ${theme.breakpoints.down('md')} {
        min-width: 192px;
      }
    `,
    heading: css`
      text-transform: uppercase;
      color: ${complete ? theme.v1.palette.blue95 : '#FFB357'};
      margin-bottom: ${theme.spacing(2)};
    `,
    title: css`
      margin-bottom: ${theme.spacing(2)};
    `,
    url: css`
      display: inline-block;
    `,
    learnUrl: css`
      border-top: 1px solid ${theme.colors.border.weak};
      position: absolute;
      bottom: 0;
      padding: 8px 16px;
      width: 100%;
    `,
  };
};
