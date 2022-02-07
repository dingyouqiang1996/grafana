package notifiers

import (
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/encryption"
	"github.com/grafana/grafana/pkg/services/notifications"
	"golang.org/x/net/context"
)

// Provision alert notifiers
func Provision(ctx context.Context, configDirectory string, encryptionService encryption.Internal, notificationService *notifications.NotificationService) error {
	dc := newNotificationProvisioner(encryptionService, notificationService, log.New("provisioning.notifiers"))
	return dc.applyChanges(ctx, configDirectory)
}

// NotificationProvisioner is responsible for provsioning alert notifiers
type NotificationProvisioner struct {
	log         log.Logger
	cfgProvider *configReader
}

func newNotificationProvisioner(encryptionService encryption.Internal, notifiationService *notifications.NotificationService, log log.Logger) NotificationProvisioner {
	return NotificationProvisioner{
		log: log,
		cfgProvider: &configReader{
			encryptionService:   encryptionService,
			notificationService: notifiationService,
			log:                 log,
		},
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
			getOrg := &models.GetOrgByNameQuery{Name: notification.OrgName}
			if err := bus.Dispatch(ctx, getOrg); err != nil {
				return err
			}
			notification.OrgID = getOrg.Result.Id
		} else if notification.OrgID < 0 {
			notification.OrgID = 1
		}

		getNotification := &models.GetAlertNotificationsWithUidQuery{Uid: notification.UID, OrgId: notification.OrgID}

		if err := bus.Dispatch(ctx, getNotification); err != nil {
			return err
		}

		if getNotification.Result != nil {
			cmd := &models.DeleteAlertNotificationWithUidCommand{Uid: getNotification.Result.Uid, OrgId: getNotification.OrgId}
			if err := bus.Dispatch(ctx, cmd); err != nil {
				return err
			}
		}
	}

	return nil
}

func (dc *NotificationProvisioner) mergeNotifications(ctx context.Context, notificationToMerge []*notificationFromConfig) error {
	for _, notification := range notificationToMerge {
		if notification.OrgID == 0 && notification.OrgName != "" {
			getOrg := &models.GetOrgByNameQuery{Name: notification.OrgName}
			if err := bus.Dispatch(ctx, getOrg); err != nil {
				return err
			}
			notification.OrgID = getOrg.Result.Id
		} else if notification.OrgID < 0 {
			notification.OrgID = 1
		}

		cmd := &models.GetAlertNotificationsWithUidQuery{OrgId: notification.OrgID, Uid: notification.UID}
		err := bus.Dispatch(ctx, cmd)
		if err != nil {
			return err
		}

		if cmd.Result == nil {
			dc.log.Debug("inserting alert notification from configuration", "name", notification.Name, "uid", notification.UID)
			insertCmd := &models.CreateAlertNotificationCommand{
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

			if err := bus.Dispatch(ctx, insertCmd); err != nil {
				return err
			}
		} else {
			dc.log.Debug("updating alert notification from configuration", "name", notification.Name)
			updateCmd := &models.UpdateAlertNotificationWithUidCommand{
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

			if err := bus.Dispatch(ctx, updateCmd); err != nil {
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
