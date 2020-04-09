import { css } from 'emotion';
import React from 'react';
import { transformersUIRegistry } from '@grafana/ui';
import { DataTransformerConfig, DataFrame, transformDataFrame, SelectableValue } from '@grafana/data';
import { Button, CustomScrollbar, Select, useTheme } from '@grafana/ui';
import { TransformationOperationRow } from './TransformationOperationRow';

interface Props {
  onChange: (transformations: DataTransformerConfig[]) => void;
  transformations: DataTransformerConfig[];
  dataFrames: DataFrame[];
}

interface State {
  addingTransformation: boolean;
}

export class TransformationsEditor extends React.PureComponent<Props, State> {
  state = { addingTransformation: false };

  onTransformationAdd = (selectable: SelectableValue<string>) => {
    const { transformations, onChange } = this.props;
    onChange([
      ...transformations,
      {
        id: selectable.value as string,
        options: {},
      },
    ]);
    this.setState({ addingTransformation: false });
  };

  onTransformationChange = (idx: number, config: DataTransformerConfig) => {
    const { transformations, onChange } = this.props;
    const next = Array.from(transformations);
    next[idx] = config;
    onChange(next);
  };

  onTransformationRemove = (idx: number) => {
    const { transformations, onChange } = this.props;
    const next = Array.from(transformations);
    next.splice(idx, 1);
    onChange(next);
  };

  renderTransformationSelector = () => {
    if (!this.state.addingTransformation) {
      return null;
    }

    const availableTransformers = transformersUIRegistry.list().map(t => {
      return {
        value: t.transformer.id,
        label: t.transformer.name,
      };
    });

    return (
      <div
        className={css`
          margin-bottom: 10px;
        `}
      >
        <Select
          options={availableTransformers}
          placeholder="Select transformation"
          onChange={this.onTransformationAdd}
        />
      </div>
    );
  };

  renderTransformationEditors = () => {
    const { transformations, dataFrames } = this.props;
    const preTransformData = dataFrames;

    return (
      <>
        {transformations.map((t, i) => {
          let editor;

          const transformationUI = transformersUIRegistry.getIfExists(t.id);
          if (!transformationUI) {
            return null;
          }

          const input = transformDataFrame(transformations.slice(0, i), preTransformData);
          const output = transformDataFrame(transformations.slice(i), input);

          if (transformationUI) {
            editor = React.createElement(transformationUI.component, {
              options: { ...transformationUI.transformer.defaultOptions, ...t.options },
              input,
              onChange: (options: any) => {
                this.onTransformationChange(i, {
                  id: t.id,
                  options,
                });
              },
            });
          }

          return (
            <TransformationOperationRow
              key={`${t.id}-${i}`}
              input={input || []}
              output={output || []}
              onRemove={() => this.onTransformationRemove(i)}
              editor={editor}
              name={transformationUI ? transformationUI.name : ''}
              description={transformationUI ? transformationUI.description : ''}
            />
          );
        })}
      </>
    );
  };

  render() {
    return (
      <ScrollWrapper>
        <CustomScrollbar
          className={css`
            height: 100%;
          `}
        >
          <p className="muted text-center" style={{ padding: '8px' }}>
            Transformations allow you to combine, re-order, hide and rename specific parts the the data set before being
            visualized.
          </p>
          {this.renderTransformationEditors()}
          {this.renderTransformationSelector()}
          <Button variant="secondary" icon="plus-circle" onClick={() => this.setState({ addingTransformation: true })}>
            Add transformation
          </Button>
        </CustomScrollbar>
      </ScrollWrapper>
    );
  }
}

const ScrollWrapper: React.FC = ({ children }) => {
  const theme = useTheme();
  return (
    <div
      className={css`
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        max-height: 100%;
        padding: ${theme.spacing.md};
      `}
    >
      <div
        className={css`
          flex-grow: 1;
          height: 100%;
          overflow: hidden;
        `}
      >
        {children}
      </div>
    </div>
  );
};
