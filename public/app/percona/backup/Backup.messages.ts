export const Messages = {
  add: 'Add',
  addStorageLocation: 'Add storage location',
  createNewBackup: 'Create backup',
  createScheduledBackup: 'Create scheduled backup',
  backupManagement: 'Backup Management',
  backupInventory: {
    newBackup: 'New backup',
    table: {
      noData: 'No backups found',
      columns: {
        name: 'Backup name',
        service: 'Service Name',
        created: 'Created',
        location: 'Location',
        vendor: 'DB Technology',
        status: 'Status',
        actions: 'Actions',
        type: 'Type',
      },
      status: {
        invalid: 'Invalid',
        pending: 'Pending',
        inProgress: 'In progress',
        paused: 'Paused',
        success: 'Success',
        error: 'Error',
      },
      dataModel: {
        invalid: 'Invalid',
        physical: 'Physical',
        logical: 'Logical',
      },
      actions: 'Actions',
    },
    deleteModalTitle: 'Delete backup artifact',
    deleteFromStorage: 'Delete from storage',
    deleteWarning:
      "For security reasons, we won't delete this backup from the filesystem. Please make sure to manually remove it.",
    restoreStarted: 'Restore has successfully started',
    getLogsTitle: (name: string) => `Backup logs for ${name}`,
    getDeleteMessage: (name: string) => `Are you sure you want to delete "${name}"?`,
    addSuccess: 'Backup successfully started',
    getDeleteSuccess: (name: string) => `Backup "${name}" successfully deleted.`,
  },
  restoreHistory: {
    table: {
      noData: 'No restores found',
      columns: {
        started: 'Started at',
        finished: 'Finished at',
        actions: 'Actions',
      },
    },
  },
  storageLocations: {
    table: {
      noData: 'No storage locations found',
      columns: {
        name: 'Name',
        type: 'Type',
        path: 'Endpoint or path',
        labels: 'Labels',
        actions: 'Actions',
      },
    },
    addSuccess: 'Backup location was successfully added',
    testSuccess: 'This storage location is valid',
    editSuccess: (name: string) => `Backup location "${name}" was successfully updated`,
    getDeleteSuccess: (name: string) => `Backup location "${name}" successfully deleted.`,
  },
  scheduledBackups: {
    newScheduledBackup: 'New Scheduled Backup',
    table: {
      noData: 'No scheduled backups found',
      columns: {
        name: 'Name',
        vendor: 'DB Technology',
        start: 'Start at',
        retention: 'Retention',
        frequency: 'Frequency',
        location: 'Location',
        lastBackup: 'Last backup (local time)',
        type: 'Type',
        actions: 'Actions',
      },
    },
    deleteModalTitle: 'Delete scheduled backup',
    copyOf: 'Copy of',
    addSuccess: 'Backup successfully scheduled',
    unlimited: 'Unlimited',
    getEditSuccess: (name: string) => `Scheduled backup "${name}" successfully updated`,
    getDeleteSuccess: (name: string) => `Scheduled backup "${name}" successfully deleted.`,
    getDeleteMessage: (name: string) => `Are you sure you want to delete the scheduled backup "${name}"?`,
  },
  status: {
    invalid: 'Invalid',
    pending: 'Pending',
    inProgress: 'In progress',
    deleting: 'Deleting',
    paused: 'Paused',
    success: 'Success',
    error: 'Error',
    failedToDelete: 'Failed to delete',
  },
  dataModel: {
    invalid: 'Invalid',
    physical: 'Physical',
    logical: 'Logical',
  },
  backupMode: {
    full: 'Full',
    incremental: 'Incremental',
    pitr: 'PITR',
    invalid: 'Invalid',
  },
};
