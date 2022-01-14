import React, { FC } from 'react';

import { useStyles } from '@grafana/ui';

import { Messages } from './DescriptionBlock.messages';
import { getStyles } from './DescriptionBlock.styles';
import { DescriptionBlockProps } from './DescriptionBlock.types';

export const DescriptionBlock: FC<DescriptionBlockProps> = ({ description, dataQa }) => {
  const styles = useStyles(getStyles);

  return (
    <div data-qa={dataQa} className={styles.descriptionWrapper}>
      <span>{Messages.description}</span>
      <pre>{description}</pre>
    </div>
  );
};
