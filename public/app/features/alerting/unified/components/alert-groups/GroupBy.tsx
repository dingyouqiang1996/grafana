import { uniq } from 'lodash';

import { SelectableValue } from '@grafana/data';
import { Icon, Label, MultiSelect } from '@grafana/ui';
import { AlertmanagerGroup } from 'app/plugins/datasource/alertmanager/types';

import { isPrivateLabelKey } from '../../utils/labels';

interface Props {
  groups: AlertmanagerGroup[];
  groupBy: string[];
  onGroupingChange: (keys: string[]) => void;
}

export const GroupBy = ({ groups, groupBy, onGroupingChange }: Props) => {
  const labelKeyOptions = uniq(groups.flatMap((group) => group.alerts).flatMap(({ labels }) => Object.keys(labels)))
    .filter((label) => !isPrivateLabelKey(label)) // Filter out private labels
    .map<SelectableValue>((key) => ({
      label: key,
      value: key,
    }));

  return (
    <div data-testid={'group-by-container'}>
      <Label>Custom group by</Label>
      <MultiSelect
        aria-label={'group by label keys'}
        value={groupBy}
        placeholder="Group by"
        prefix={<Icon name={'tag-alt'} />}
        onChange={(items) => {
          onGroupingChange(items.map(({ value }) => value as string));
        }}
        options={labelKeyOptions}
        width={34}
      />
    </div>
  );
};
