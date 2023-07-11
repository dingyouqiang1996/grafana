import { css } from '@emotion/css';
import { debounce, take, uniqueId } from 'lodash';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { GrafanaTheme2, SelectableValue } from '@grafana/data';
import { AsyncSelect, Button, Field, InputControl, Label, useStyles2 } from '@grafana/ui';
import { useDispatch } from 'app/types';
import { CombinedRuleGroup } from 'app/types/unified-alerting';

import { useCombinedRuleNamespaces } from '../../hooks/useCombinedRuleNamespaces';
import { useUnifiedAlertingSelector } from '../../hooks/useUnifiedAlertingSelector';
import { fetchRulerRulesAction } from '../../state/actions';
import { RuleFormValues } from '../../types/rule-form';
import { GRAFANA_RULES_SOURCE_NAME } from '../../utils/datasource';
import { MINUTE } from '../../utils/rule-form';
import { isGrafanaRulerRule } from '../../utils/rules';
import { ProvisioningBadge } from '../Provisioning';

import { Folder, RuleFolderPicker } from './RuleFolderPicker';
import { checkForPathSeparator } from './util';

export const MAX_GROUP_RESULTS = 1000;

export const useGetGroupOptionsFromFolder = (folderTitle: string) => {
  const dispatch = useDispatch();

  // fetch the ruler rules from the database so we can figure out what other "groups" are already defined
  // for our folders
  useEffect(() => {
    dispatch(fetchRulerRulesAction({ rulesSourceName: GRAFANA_RULES_SOURCE_NAME }));
  }, [dispatch]);

  const rulerRuleRequests = useUnifiedAlertingSelector((state) => state.rulerRules);
  const groupfoldersForGrafana = rulerRuleRequests[GRAFANA_RULES_SOURCE_NAME];

  const grafanaFolders = useCombinedRuleNamespaces(GRAFANA_RULES_SOURCE_NAME);
  const folderGroups = grafanaFolders.find((f) => f.name === folderTitle)?.groups ?? [];

  const groupOptions = folderGroups
    .map<SelectableValue<string>>((group) => ({
      label: group.name,
      value: group.name,
      description: group.interval ?? MINUTE,
      // we include provisioned folders, but disable the option to select them
      isDisabled: isProvisionedGroup(group),
    }))
    .sort(sortByLabel);

  return { groupOptions, loading: groupfoldersForGrafana?.loading };
};

const isProvisionedGroup = (group: CombinedRuleGroup) => {
  return group.rules.some(
    (rule) => isGrafanaRulerRule(rule.rulerRule) && Boolean(rule.rulerRule.grafana_alert.provenance) === true
  );
};

const sortByLabel = (a: SelectableValue<string>, b: SelectableValue<string>) => {
  return a.label?.localeCompare(b.label ?? '') || 0;
};

const findGroupMatchingLabel = (group: SelectableValue<string>, query: string) => {
  return group.label?.toLowerCase().includes(query.toLowerCase());
};

export function FolderAndGroup() {
  const {
    formState: { errors },
    watch,
    setValue,
    control,
  } = useFormContext<RuleFormValues>();

  const styles = useStyles2(getStyles);

  const folder = watch('folder');
  const group = watch('group');

  const { groupOptions, loading } = useGetGroupOptionsFromFolder(folder?.title ?? '');

  const resetGroup = useCallback(() => {
    setValue('group', '');
  }, [setValue]);

  const getOptions = useCallback(
    async (query: string) => {
      const results = query ? groupOptions.filter((group) => findGroupMatchingLabel(group, query)) : groupOptions;
      return take(results, MAX_GROUP_RESULTS);
    },
    [groupOptions]
  );

  const debouncedSearch = useMemo(() => {
    return debounce(getOptions, 300, { leading: true });
  }, [getOptions]);

  const defaultGroupValue = group ? { value: group, label: group } : undefined;

  return (
    <div className={styles.container}>
      <div className={styles.evaluationGroupsContainer}>
        <Field
          label={
            <Label htmlFor="folder" description={'Select a folder to store your rule.'}>
              Folder
            </Label>
          }
          className={styles.formInput}
          error={errors.folder?.message}
          invalid={!!errors.folder?.message}
          data-testid="folder-picker"
        >
          <InputControl
            render={({ field: { ref, ...field } }) => (
              <RuleFolderPicker
                inputId="folder"
                {...field}
                enableReset={true}
                onChange={({ title, uid }) => {
                  field.onChange({ title, uid });
                  resetGroup();
                }}
              />
            )}
            name="folder"
            rules={{
              required: { value: true, message: 'Select a folder' },
              validate: {
                pathSeparator: (folder: Folder) => checkForPathSeparator(folder.title),
              },
            }}
          />
        </Field>

        <div className={styles.addButton}>
          <span>or</span>
          <Button onClick={() => {}} type="button" icon="plus" fill="outline" variant="secondary">
            New folder
          </Button>
        </div>
      </div>

      <div className={styles.evaluationGroupsContainer}>
        <Field
          label="Evaluation group"
          data-testid="group-picker"
          description="Rules within the same group are evaluated sequentially over the same time interval"
          className={styles.formInput}
          error={errors.group?.message}
          invalid={!!errors.group?.message}
        >
          <InputControl
            render={({ field: { ref, ...field }, fieldState }) => (
              <AsyncSelect
                disabled={!folder || loading}
                inputId="group"
                key={uniqueId()}
                {...field}
                onChange={(group) => {
                  field.onChange(group.label ?? '');
                }}
                isLoading={loading}
                invalid={Boolean(folder) && !group && Boolean(fieldState.error)}
                loadOptions={debouncedSearch}
                cacheOptions
                loadingMessage={'Loading groups...'}
                defaultValue={defaultGroupValue}
                defaultOptions={groupOptions}
                getOptionLabel={(option: SelectableValue<string>) => (
                  <div>
                    <span>{option.label}</span>
                    {/* making the assumption here that it's provisioned when it's disabled, should probably change this */}
                    {option.isDisabled && (
                      <>
                        {' '}
                        <ProvisioningBadge />
                      </>
                    )}
                  </div>
                )}
                placeholder={'Select an evaluation group...'}
              />
            )}
            name="group"
            control={control}
            rules={{
              required: { value: true, message: 'Must enter a group name' },
              validate: {
                pathSeparator: (group_: string) => checkForPathSeparator(group_),
              },
            }}
          />
        </Field>

        <div className={styles.addButton}>
          <span>or</span>
          <Button onClick={() => {}} type="button" icon="plus" fill="outline" variant="secondary">
            New evaluation group
          </Button>
        </div>
      </div>
    </div>
  );
}
const getStyles = (theme: GrafanaTheme2) => ({
  container: css`
    margin-top: ${theme.spacing(1)};
    display: flex;
    flex-direction: column;
    align-items: baseline;
    max-width: ${theme.breakpoints.values.lg}px;
    justify-content: space-between;
  `,
  evaluationGroupsContainer: css`
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing(2)};
  `,

  addButton: css`
    display: flex;
    direction: row;
    gap: ${theme.spacing(2)};
    line-height: 2;
    margin-top: 35px;
  `,
  formInput: css`
    max-width: ${theme.breakpoints.values.sm}px;
    flex-grow: 1;

    label {
      width: ${theme.breakpoints.values.sm}px;
    }
  `,
});
