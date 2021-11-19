import React, { FC, useCallback } from 'react';
import { Button, useTheme2 } from '@grafana/ui';
import { StandardEditorProps, StandardEditorsRegistryItem } from '@grafana/data';

import { FeatureStyleConfig } from '../types';
import { DEFAULT_STYLE_RULE } from '../layers/data/geojsonLayer';
import { StyleRuleEditor, StyleRuleEditorSettings } from './StyleRuleEditor';
import { defaultStyleConfig } from '../style/types';

export const GeomapStyleRulesEditor: FC<StandardEditorProps<FeatureStyleConfig[], any, any>> = (props) => {
  const { value, onChange, context, item } = props;
  const theme = useTheme2();

  const settings = item.settings;
  const onAddRule = useCallback(() => {
    const {palette} = theme.visualization;
    const color = {
       fixed: palette[Math.floor(Math.random() * palette.length)];
    }

    const newRule = [
      ...value,
      { ...DEFAULT_STYLE_RULE, style: { ...defaultStyleConfig, color } },
    ];

    onChange(newRule);
  }, [onChange, value, theme.visualization.palette]);

  const onRuleChange = useCallback(
    (idx) => (style: FeatureStyleConfig | undefined) => {
      const copyStyles = [...value];
      if (style) {
        copyStyles[idx] = style;
      } else {
        //assume undefined is only returned on delete
        copyStyles.splice(idx, 1);
      }
      onChange(copyStyles);
    },
    [onChange, value]
  );

  const styleOptions =
    value &&
    value.map((style, idx: number) => {
      const itemSettings: StandardEditorsRegistryItem<any, StyleRuleEditorSettings> = {
        settings,
      } as any;

      return (
        <StyleRuleEditor
          value={style}
          onChange={onRuleChange(idx)}
          context={context}
          item={itemSettings}
          key={`${idx}-${style.check?.property}`}
        />
      );
    });

  return (
    <>
      {styleOptions}
      <Button size="sm" icon="plus" onClick={onAddRule} variant="secondary" aria-label={'Add geomap style rule'}>
        {'Add style rule'}
      </Button>
    </>
  );
};
