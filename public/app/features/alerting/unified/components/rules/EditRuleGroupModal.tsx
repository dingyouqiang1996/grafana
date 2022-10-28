import { css } from '@emotion/css';
import React, { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { GrafanaTheme2 } from '@grafana/data';
import { Modal, Button, Field, Input, useStyles2 } from '@grafana/ui';
import { useAppNotification } from 'app/core/copy/appNotification';
import { useCleanup } from 'app/core/hooks/useCleanup';
import { useDispatch } from 'app/types';
import { CombinedRuleGroup, CombinedRuleNamespace } from 'app/types/unified-alerting';
import { RulerRulesConfigDTO, RulerRuleGroupDTO, RulerRuleDTO } from 'app/types/unified-alerting-dto';

import { useUnifiedAlertingSelector } from '../../hooks/useUnifiedAlertingSelector';
import { updateLotexNamespaceAndGroupAction } from '../../state/actions';
import { checkEvaluationIntervalGlobalLimit } from '../../utils/config';
import { getRulesSourceName } from '../../utils/datasource';
import { initialAsyncRequestState } from '../../utils/redux';
import { isGrafanaRulerRule, isAlertingRulerRule } from '../../utils/rules';
import { DynamicTable, DynamicTableColumnProps, DynamicTableItemProps } from '../DynamicTable';
import { EvaluationIntervalLimitExceeded } from '../InvalidIntervalWarning';
import { evaluateEveryValidationOptions } from '../rule-editor/GrafanaEvaluationBehavior';

const MINUTE = '1m';
interface AlertWithFor {
  alertName: string;
  forDuration: string;
}

export const getAlertInfo = (alert: RulerRuleDTO): AlertWithFor => {
  const emptyAlert: AlertWithFor = {
    alertName: '',
    forDuration: '0s',
  };
  if (isGrafanaRulerRule(alert)) {
    return {
      alertName: alert.grafana_alert.title,
      forDuration: alert.for,
    };
  }
  if (isAlertingRulerRule(alert)) {
    return {
      alertName: alert.alert,
      forDuration: alert.for ?? '1m',
    };
  }
  return emptyAlert;
};
export const getIntervalForGroup = (
  rulerRules: RulerRulesConfigDTO | null | undefined,
  group: string,
  folder: string
) => {
  const folderObj: Array<RulerRuleGroupDTO<RulerRuleDTO>> = rulerRules ? rulerRules[folder] : [];
  const groupObj = folderObj?.find((rule) => rule.name === group);

  const interval = groupObj?.interval ?? MINUTE;
  return interval;
};

type AlertsWithForTableColumnProps = DynamicTableColumnProps<AlertWithFor>;
type AlertsWithForTableProps = DynamicTableItemProps<AlertWithFor>;

export const RulesForGroupTable = ({
  rulerRules,
  group,
  folder,
}: {
  rulerRules: RulerRulesConfigDTO | null | undefined;
  group: string;
  folder: string;
}) => {
  const styles = useStyles2(getStyles);
  const folderObj: Array<RulerRuleGroupDTO<RulerRuleDTO>> = rulerRules ? rulerRules[folder] : [];
  const groupObj = folderObj?.find((rule) => rule.name === group);
  const rules: RulerRuleDTO[] = groupObj?.rules ?? [];
  const rows: AlertsWithForTableProps[] = rules.map((rule: RulerRuleDTO, index) => ({
    id: index,
    data: getAlertInfo(rule),
  }));

  function getColumns(): AlertsWithForTableColumnProps[] {
    return [
      {
        id: 'alertName',
        label: 'Alert',
        renderCell: ({ data: { alertName } }) => {
          return <>{alertName}</>;
        },
        size: 0.7,
      },
      {
        id: 'for',
        label: 'For',
        renderCell: ({ data: { forDuration } }) => {
          return <>{forDuration}</>;
        },
        size: 0.3,
      },
    ];
  }
  return (
    <div className={styles.tableWrapper}>
      <DynamicTable items={rows} cols={getColumns()} />
    </div>
  );
};

interface ModalProps {
  namespace: CombinedRuleNamespace;
  group: CombinedRuleGroup;
  onClose: (saved?: boolean) => void;
}

interface FormValues {
  namespaceName: string;
  groupName: string;
  groupInterval: string;
}

export function EditCloudGroupModal(props: ModalProps): React.ReactElement {
  const { namespace, group, onClose } = props;
  const styles = useStyles2(getStyles);
  const dispatch = useDispatch();
  const { loading, error, dispatched } =
    useUnifiedAlertingSelector((state) => state.updateLotexNamespaceAndGroup) ?? initialAsyncRequestState;
  const notifyApp = useAppNotification();

  const defaultValues = useMemo(
    (): FormValues => ({
      namespaceName: namespace.name,
      groupName: group.name,
      groupInterval: group.interval ?? '',
    }),
    [namespace, group]
  );

  // close modal if successfully saved
  useEffect(() => {
    if (dispatched && !loading && !error) {
      onClose(true);
    }
  }, [dispatched, loading, onClose, error]);

  useCleanup((state) => (state.unifiedAlerting.updateLotexNamespaceAndGroup = initialAsyncRequestState));

  const onSubmit = (values: FormValues) => {
    dispatch(
      updateLotexNamespaceAndGroupAction({
        rulesSourceName: getRulesSourceName(namespace.rulesSource),
        groupName: group.name,
        newGroupName: values.groupName,
        namespaceName: namespace.name,
        newNamespaceName: values.namespaceName,
        groupInterval: values.groupInterval || undefined,
      })
    );
  };

  const formAPI = useForm<FormValues>({
    mode: 'onSubmit',
    defaultValues,
    shouldFocusError: true,
  });
  const {
    handleSubmit,
    register,
    watch,
    formState: { isDirty, errors },
  } = formAPI;

  const onInvalid = () => {
    notifyApp.error('There are errors in the form. Please correct them and try again!');
  };

  const rulerRuleRequests = useUnifiedAlertingSelector((state) => state.rulerRules);
  const groupfoldersForSource = rulerRuleRequests[getRulesSourceName(namespace.rulesSource)];

  return (
    <Modal
      className={styles.modal}
      isOpen={true}
      title="Edit namespace or rule group"
      onDismiss={onClose}
      onClickBackdrop={onClose}
    >
      <FormProvider {...formAPI}>
        <form onSubmit={(e) => e.preventDefault()} key={JSON.stringify(defaultValues)}>
          <>
            <Field label="Namespace" invalid={!!errors.namespaceName} error={errors.namespaceName?.message}>
              <Input
                id="namespaceName"
                {...register('namespaceName', {
                  required: 'Namespace name is required.',
                })}
              />
            </Field>
            <Field label="Rule group" invalid={!!errors.groupName} error={errors.groupName?.message}>
              <Input
                id="groupName"
                {...register('groupName', {
                  required: 'Rule group name is required.',
                })}
              />
            </Field>
            <Field
              label="Rule group evaluation interval"
              invalid={!!errors.groupInterval}
              error={errors.groupInterval?.message}
            >
              <Input
                id="groupInterval"
                placeholder="1m"
                {...register('groupInterval', evaluateEveryValidationOptions)}
              />
            </Field>

            {checkEvaluationIntervalGlobalLimit(watch('groupInterval')).exceedsLimit && (
              <EvaluationIntervalLimitExceeded />
            )}
            {rulerRuleRequests && (
              <>
                <div>List of rules that belong to this group</div>
                <RulesForGroupTable
                  rulerRules={groupfoldersForSource.result}
                  group={group.name}
                  folder={namespace.name}
                />
              </>
            )}

            <Modal.ButtonRow>
              <Button
                variant="secondary"
                type="button"
                disabled={loading}
                onClick={() => onClose(false)}
                fill="outline"
              >
                Close
              </Button>
              <Button
                type="button"
                disabled={!isDirty || loading}
                onClick={handleSubmit((values) => onSubmit(values), onInvalid)}
              >
                {loading ? 'Saving...' : 'Save changes'}
              </Button>
            </Modal.ButtonRow>
          </>
        </form>
      </FormProvider>
    </Modal>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  modal: css`
    max-width: 560px;
  `,
  formInput: css`
    width: 275px;
    & + & {
      margin-left: ${theme.spacing(3)};
    }
  `,
  tableWrapper: css`
    margin-top: ${theme.spacing(2)};
    margin-bottom: ${theme.spacing(2)};
  `,
});
