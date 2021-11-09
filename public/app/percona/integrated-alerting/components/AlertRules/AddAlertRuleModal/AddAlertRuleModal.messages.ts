export const Messages = {
  channels: {
    email: 'Email',
    pagerDuty: 'PagerDuty',
    slack: 'Slack',
  },
  severities: {
    SEVERITY_CRITICAL: 'Critical',
    SEVERITY_ERROR: 'High',
    SEVERITY_WARNING: 'Warning',
    SEVERITY_NOTICE: 'Notice',
  },
  tooltips: {
    template: 'The alert template to use for this rule.',
    name: 'The name for this rule.',
    duration: 'The alert query duration, in seconds.',
    severity:
      'The severity level for the alert triggered by this rule. Either "Warning", "Notice", "High" or "Critical".',
    channels: 'Which notification channels should be used to send the alert through.',
    filters: 'Apply rule only to required services or nodes.',
  },
  title: 'Add Alert Rule',
  addRuleTitle: 'Add Alert Rule',
  editRuleTitle: 'Edit Alert Rule',
  create: 'Add',
  update: 'Save',
  cancel: 'Cancel',
  createSuccess: 'Alert rule created',
  updateSuccess: 'Alert rule updated',
  templateField: 'Template',
  nameField: 'Name',
  thresholdField: 'Threshold',
  durationField: 'Duration (s)',
  filtersField: 'Filters',
  severityField: 'Severity',
  channelField: 'Channels',
  activateSwitch: 'Activate',
  templateExpression: 'Template Expression',
  ruleAlert: 'Rule Alert',
};
