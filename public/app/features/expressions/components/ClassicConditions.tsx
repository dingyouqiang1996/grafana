import React, { FC } from 'react';
import { SelectableValue } from '@grafana/data';
import { Button, Icon, InlineField, InlineFieldRow } from '@grafana/ui';
import { Condition } from './Condition';
import { ClassicCondition, ExpressionQuery } from '../types';
import { defaultCondition } from '../utils/expressionTypes';

interface Props {
  query: ExpressionQuery;
  refIds: Array<SelectableValue<string>>;
  onChange: (query: ExpressionQuery) => void;
}

export const ClassicConditions: FC<Props> = ({ onChange, query, refIds }) => {
  const onConditionChange = (condition: ClassicCondition, index: number) => {
    if (query.conditions) {
      onChange({
        ...query,
        conditions: [...query.conditions.slice(0, index), condition, ...query.conditions.slice(index + 1)],
      });
    }
  };

  const onAddCondition = () => {
    if (query.conditions) {
      onChange({
        ...query,
        conditions: query.conditions.length > 0 ? [...query.conditions, defaultCondition] : [defaultCondition],
      });
    }
  };

  const onRemoveCondition = (index: number) => {
    if (query.conditions) {
      delete query.conditions[index];

      onChange({
        ...query,
        conditions: query.conditions.length - 1 > 0 ? [...query.conditions] : [],
      });
    }
  };

  return (
    <div>
      <InlineFieldRow>
        <InlineField label="Conditions" labelWidth={14}>
          <div>
            {query.conditions?.map((condition, index) => {
              if (!condition) {
                return;
              }
              return (
                <Condition
                  key={index}
                  index={index}
                  condition={condition}
                  onChange={(condition: ClassicCondition) => onConditionChange(condition, index)}
                  onRemoveCondition={onRemoveCondition}
                  refIds={refIds}
                />
              );
            })}
          </div>
        </InlineField>
      </InlineFieldRow>
      <Button variant="secondary" onClick={onAddCondition}>
        <Icon name="plus-circle" />
      </Button>
    </div>
  );
};
