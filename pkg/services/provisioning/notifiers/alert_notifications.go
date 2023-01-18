package notifiers

import (
	"context"

	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/services/alerting"
	"github.com/grafana/grafana/pkg/services/encryption"
	"github.com/grafana/grafana/pkg/services/notifications"
	"github.com/grafana/grafana/pkg/services/org"
)

type Manager interface {
	GetAlertNotifications(ctx context.Context, query *alerting.GetAlertNotificationsQuery) error
	CreateAlertNotificationCommand(ctx context.Context, cmd *alerting.CreateAlertNotificationCommand) error
	UpdateAlertNotification(ctx context.Context, cmd *alerting.UpdateAlertNotificationCommand) error
	DeleteAlertNotification(ctx context.Context, cmd *alerting.DeleteAlertNotificationCommand) error
	GetAllAlertNotifications(ctx context.Context, query *alerting.GetAllAlertNotificationsQuery) error
	GetOrCreateAlertNotificationState(ctx context.Context, cmd *alerting.GetOrCreateNotificationStateQuery) error
	SetAlertNotificationStateToCompleteCommand(ctx context.Context, cmd *alerting.SetAlertNotificationStateToCompleteCommand) error
	SetAlertNotificationStateToPendingCommand(ctx context.Context, cmd *alerting.SetAlertNotificationStateToPendingCommand) error
	GetAlertNotificationsWithUid(ctx context.Context, query *alerting.GetAlertNotificationsWithUidQuery) error
	DeleteAlertNotificationWithUid(ctx context.Context, cmd *alerting.DeleteAlertNotificationWithUidCommand) error
	GetAlertNotificationsWithUidToSend(ctx context.Context, query *alerting.GetAlertNotificationsWithUidToSendQuery) error
	UpdateAlertNotificationWithUid(ctx context.Context, cmd *alerting.UpdateAlertNotificationWithUidCommand) error
}

// Provision alert notifiers
func Provision(ctx context.Context, configDirectory string, alertingService Manager, orgService org.Service, encryptionService encryption.Internal, notificationService *notifications.NotificationService) error {
	dc := newNotificationProvisioner(orgService, alertingService, encryptionService, notificationService, log.New("provisioning.notifiers"))
	return dc.applyChanges(ctx, configDirectory)
}

// NotificationProvisioner is responsible for provsioning alert notifiers
type NotificationProvisioner struct {
	log             log.Logger
	cfgProvider     *configReader
	alertingManager Manager
	orgService      org.Service
}

func newNotificationProvisioner(orgService org.Service, alertingManager Manager, encryptionService encryption.Internal, notifiationService *notifications.NotificationService, log log.Logger) NotificationProvisioner {
	return NotificationProvisioner{
		log:             log,
		alertingManager: alertingManager,
		cfgProvider: &configReader{
			encryptionService:   encryptionService,
			notificationService: notifiationService,
			log:                 log,
			orgService:          orgService,
		},
		orgService: orgService,
	}
}

func (dc *NotificationProvisioner) apply(ctx context.Context, cfg *notificationsAsConfig) error {
	if err := dc.deleteNotifications(ctx, cfg.DeleteNotifications); err != nil {
		return err
	}

	if err := dc.mergeNotifications(ctx, cfg.Notifications); err != nil {
		return err
	}

	return nil
}

func (dc *NotificationProvisioner) deleteNotifications(ctx context.Context, notificationToDelete []*deleteNotificationConfig) error {
	for _, notification := range notificationToDelete {
		dc.log.Info("Deleting alert notification", "name", notification.Name, "uid", notification.UID)

		if notification.OrgID == 0 && notification.OrgName != "" {
			getOrg := org.GetOrgByNameQuery{Name: notification.OrgName}
			res, err := dc.orgService.GetByName(ctx, &getOrg)
			if err != nil {
				return err
			}
			notification.OrgID = res.ID
		} else if notification.OrgID < 0 {
			notification.OrgID = 1
		}

		getNotification := &alerting.GetAlertNotificationsWithUidQuery{Uid: notification.UID, OrgId: notification.OrgID}

		if err := dc.alertingManager.GetAlertNotificationsWithUid(ctx, getNotification); err != nil {
			return err
		}

		if getNotification.Result != nil {
			cmd := &alerting.DeleteAlertNotificationWithUidCommand{Uid: getNotification.Result.Uid, OrgId: getNotification.OrgId}
			if err := dc.alertingManager.DeleteAlertNotificationWithUid(ctx, cmd); err != nil {
				return err
			}
		}
	}

	return nil
}

func (dc *NotificationProvisioner) mergeNotifications(ctx context.Context, notificationToMerge []*notificationFromConfig) error {
	for _, notification := range notificationToMerge {
		if notification.OrgID == 0 && notification.OrgName != "" {
			getOrg := org.GetOrgByNameQuery{Name: notification.OrgName}
			res, err := dc.orgService.GetByName(ctx, &getOrg)
			if err != nil {
				return err
			}
			notification.OrgID = res.ID
		} else if notification.OrgID < 0 {
			notification.OrgID = 1
		}

		cmd := &alerting.GetAlertNotificationsWithUidQuery{OrgId: notification.OrgID, Uid: notification.UID}
		err := dc.alertingManager.GetAlertNotificationsWithUid(ctx, cmd)
		if err != nil {
			return err
		}

		if cmd.Result == nil {
			dc.log.Debug("inserting alert notification from configuration", "name", notification.Name, "uid", notification.UID)
			insertCmd := &alerting.CreateAlertNotificationCommand{
				Uid:                   notification.UID,
				Name:                  notification.Name,
				Type:                  notification.Type,
				IsDefault:             notification.IsDefault,
				Settings:              notification.SettingsToJSON(),
				SecureSettings:        notification.SecureSettings,
				OrgId:                 notification.OrgID,
				DisableResolveMessage: notification.DisableResolveMessage,
				Frequency:             notification.Frequency,
				SendReminder:          notification.SendReminder,
			}

			if err := dc.alertingManager.CreateAlertNotificationCommand(ctx, insertCmd); err != nil {
				return err
			}
		} else {
			dc.log.Debug("updating alert notification from configuration", "name", notification.Name)
			updateCmd := &alerting.UpdateAlertNotificationWithUidCommand{
				Uid:                   notification.UID,
				Name:                  notification.Name,
				Type:                  notification.Type,
				IsDefault:             notification.IsDefault,
				Settings:              notification.SettingsToJSON(),
				SecureSettings:        notification.SecureSettings,
				OrgId:                 notification.OrgID,
				DisableResolveMessage: notification.DisableResolveMessage,
				Frequency:             notification.Frequency,
				SendReminder:          notification.SendReminder,
			}

			if err := dc.alertingManager.UpdateAlertNotificationWithUid(ctx, updateCmd); err != nil {
				return err
			}
		}
	}

	return nil
}

func (dc *NotificationProvisioner) applyChanges(ctx context.Context, configPath string) error {
	configs, err := dc.cfgProvider.readConfig(ctx, configPath)
	if err != nil {
		return err
	}

	for _, cfg := range configs {
		if err := dc.apply(ctx, cfg); err != nil {
			return err
		}
	}

	return nil
}
