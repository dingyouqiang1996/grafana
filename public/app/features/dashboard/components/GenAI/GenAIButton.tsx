import { css } from '@emotion/css';
import React from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { Button, Spinner, useStyles2, Link, Tooltip } from '@grafana/ui';

import { useOpenAIStream } from './hooks';
import { OPEN_AI_MODEL, Message } from './utils';

export interface GenAIButtonProps {
  // Button label text
  text?: string;
  // Button label text when loading
  loadingText?: string;
  // Button click handler
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  // Messages to send to the LLM plugin
  messages: Message[];
  // Callback function that the LLM plugin streams responses to
  onGenerate: (response: string) => void;
  // Temperature for the LLM plugin. Default is 1.
  // Closer to 0 means more conservative, closer to 1 means more creative.
  temperature?: number;
}

export const GenAIButton = ({
  text = 'Auto-generate',
  loadingText = 'Generating',
  onClick: onClickProp,
  messages,
  onGenerate,
  temperature = 1,
}: GenAIButtonProps) => {
  const styles = useStyles2(getStyles);

  // TODO: Implement error handling (use error object from hook)
  const { setMessages, reply, isGenerating, value } = useOpenAIStream(OPEN_AI_MODEL, temperature);

  if (!value?.enabled && !isGenerating) {
    return null;
  }

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClickProp?.(e);
    setMessages(messages);
  };

  // Todo: Consider other options for `"` sanitation
  if (isGenerating) {
    onGenerate(reply.replace(/^"|"$/g, ''));
  }

  const getIcon = () => {
    if (isGenerating) {
      return undefined;
    }
    if (!value?.isConfigured) {
      return 'exclamation-circle';
    }
    return 'ai';
  };

  return (
    <div className={styles.wrapper}>
      {isGenerating && <Spinner size={14} />}
      <Tooltip
        show={value?.isConfigured ? false : undefined}
        interactive
        content={
          <span>
            LLM plugin not configured correctly. To enable LLM features, check your OpenAI configuration in{' '}
            <Link href={`/plugins/grafana-llm-app`}>the plugin settings</Link>.
          </span>
        }
      >
        <Button
          icon={getIcon()}
          onClick={onClick}
          fill="text"
          size="sm"
          disabled={isGenerating || !value?.isConfigured}
        >
          {!isGenerating ? text : loadingText}
        </Button>
      </Tooltip>
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  wrapper: css`
    display: flex;
  `,
});
