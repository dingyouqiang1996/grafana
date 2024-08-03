import { useEffect, useState } from 'react';

import { QueryHint } from '@grafana/data';
import { reportInteraction } from '@grafana/runtime';
import { Button, Tooltip } from '@grafana/ui';

import { PromQueryEditorProps } from '../../components/types';

export function QueryEditorHints(props: PromQueryEditorProps) {
  const [hints, setHints] = useState<QueryHint[]>([]);

  useEffect(() => {
    const query = { expr: props.query.expr, refId: props.query.refId };
    const hints = props.datasource.getQueryHints(query, props.data?.series || []).filter((hint) => hint.fix?.action);
    setHints(hints);
  }, [props.datasource, props.data, props.query]);

  return (
    <>
      {hints.length > 0 && (
        <div>
          {hints.map((hint) => {
            return (
              <Tooltip content={`${hint.label} ${hint.fix?.label}`} key={hint.type}>
                <Button
                  onClick={() => {
                    reportInteraction('grafana_query_builder_hints_clicked', {
                      hint: hint.type,
                      datasourceType: props.datasource.type,
                    });

                    if (hint.fix?.action) {
                      const newQuery = props.datasource.modifyQuery(props.query, hint.fix.action);
                      return props.onChange(newQuery);
                    }
                  }}
                  fill="outline"
                  size="sm"
                >
                  hint: {hint.fix?.title || hint.fix?.action?.type.toLowerCase().replace('_', ' ')}
                </Button>
              </Tooltip>
            );
          })}
        </div>
      )}
    </>
  );
}

QueryEditorHints.displayName = 'QueryEditorHints';
