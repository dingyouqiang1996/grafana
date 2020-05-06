import React, { FC } from 'react';
import { css } from 'emotion';
import { GrafanaTheme } from '@grafana/data';
import { stylesFactory, useTheme } from '@grafana/ui';
import { TutorialCard } from './TutorialCard';
import { Card, SetupStep } from '../types';
import { DocsCard } from './DocsCard';

interface Props {
  step: SetupStep;
}

export const Step: FC<Props> = ({ step }) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <div className={styles.setup}>
      <div className={styles.info}>
        <h2 className={styles.title}>{step.title}</h2>
        <p>{step.info}</p>
      </div>
      <div className={styles.cards}>
        {step.cards.map((card: Card, index: number) => {
          const key = `${card.title}-${index}`;
          if (card.type === 'tutorial') {
            return <TutorialCard key={key} card={card} />;
          }
          return <DocsCard key={key} card={card} />;
        })}
      </div>
    </div>
  );
};

const getStyles = stylesFactory((theme: GrafanaTheme) => {
  return {
    setup: css`
      display: flex;
      width: 90%;
    `,
    info: css`
      width: 172px;
      margin-right: 72px;
    `,
    title: css`
      color: ${theme.palette.blue95};
    `,
    cards: css`
      overflow-x: scroll;
      overflow-y: hidden;
      width: 100%;
      display: flex;
    `,
  };
});
