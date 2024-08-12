import { useEffect, useState } from 'react';

import { SelectableValue } from '@grafana/data';
import { Select } from '@grafana/ui';

import { NamespaceContext, ResourceContext } from './context';

type Props = {
  value?: string;
  onChange: (v?: string) => void;

  // The wrapped element
  Original: React.ElementType;
  props: any;
};

export function K8sNameLookup(props: Props) {
  const [focused, setFocus] = useState(false);
  const [group, setGroup] = useState<string>();
  const [version, setVersion] = useState<string>();
  const [resource, setResource] = useState<string>();
  const [namespace, setNamespace] = useState<string>();
  const [namespaced, setNamespaced] = useState<boolean>();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<Array<SelectableValue<string>>>();

  useEffect(() => {
    if (focused && group && version && resource) {
      setLoading(true);
      const fn = async () => {
        const url = namespaced
          ? `apis/${group}/${version}/namespaces/${namespace}/${resource}`
          : `apis/${group}/${version}/${resource}`;

        const response = await fetch(url + '?limit=100', {
          headers: {
            Accept:
              'application/json;as=Table;v=v1;g=meta.k8s.io,application/json;as=Table;v=v1beta1;g=meta.k8s.io,application/jso',
          },
        });
        if (!response.ok) {
          console.warn('error loading names');
          setLoading(false);
          return;
        }
        const table = await response.json();
        const options: Array<SelectableValue<string>> = [];
        table.rows.forEach((row: any) => {
          const n = row.object?.metadata?.name;
          if (n) {
            options.push({ label: n, value: n });
          }
        });
        console.log('DO QUERY', table);
        setLoading(false);
        setOptions(options);
      };
      fn();
    }
  }, [focused, namespace, group, version, resource, namespaced]);

  return (
    <NamespaceContext.Consumer>
      {(namespace) => {
        return (
          <ResourceContext.Consumer>
            {(info) => {
              // delay avoids Cannot update a component
              setTimeout(() => {
                console.log('INFO', info);
                setNamespace(namespace);
                setGroup(info?.group);
                setVersion(info?.version);
                setResource(info?.resource);
                setNamespaced(info?.namespaced);
              }, 200);
              if (info) {
                const value = props.value ? { label: props.value, value: props.value } : undefined;
                return (
                  <Select
                    allowCreateWhileLoading={true}
                    allowCustomValue={true}
                    placeholder="Enter kubernetes name"
                    loadingMessage="Loading kubernetes names..."
                    formatCreateLabel={(v) => `Use: ${v}`}
                    onFocus={() => {
                      // Delay loading until we click on the name
                      setFocus(true);
                    }}
                    options={options}
                    isLoading={loading}
                    isClearable={true}
                    defaultOptions
                    value={value}
                    onChange={(v: SelectableValue<string>) => {
                      props.onChange(v?.value ?? '');
                    }}
                    onCreateOption={(v) => {
                      props.onChange(v);
                    }}
                  />
                );
              }
              return <props.Original {...props.props} />;
            }}
          </ResourceContext.Consumer>
        );
      }}
    </NamespaceContext.Consumer>
  );
}
