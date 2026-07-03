import * as React from 'react'
import { Trans } from 'react-i18next'
import { DialogContent } from '../dialog'
import { Checkbox, CheckboxValue } from '../lib/checkbox'
import { LinkButton } from '../lib/link-button'
import {
  getNotificationSettingsUrl,
  supportsNotifications,
  supportsNotificationsPermissionRequest,
} from 'desktop-notifications'
import {
  getNotificationsPermission,
  requestNotificationsPermission,
} from '../main-process-proxy'
import { t } from '../../lib/i18n'

interface INotificationPreferencesProps {
  readonly notificationsEnabled: boolean
  readonly onNotificationsEnabledChanged: (checked: boolean) => void
}

interface INotificationPreferencesState {
  readonly suggestGrantNotificationPermission: boolean
  readonly warnNotificationsDenied: boolean
  readonly suggestConfigureNotifications: boolean
}

export class Notifications extends React.Component<
  INotificationPreferencesProps,
  INotificationPreferencesState
> {
  public constructor(props: INotificationPreferencesProps) {
    super(props)

    this.state = {
      suggestGrantNotificationPermission: false,
      warnNotificationsDenied: false,
      suggestConfigureNotifications: false,
    }
  }

  public componentDidMount() {
    this.updateNotificationsState()
  }

  private onNotificationsEnabledChanged = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    this.props.onNotificationsEnabledChanged(event.currentTarget.checked)
  }

  public render() {
    return (
      <DialogContent>
        <div className="advanced-section">
          <h2>{t('preferences.notifications.heading')}</h2>
          <Checkbox
            label={t('preferences.notifications.enable')}
            value={
              this.props.notificationsEnabled
                ? CheckboxValue.On
                : CheckboxValue.Off
            }
            onChange={this.onNotificationsEnabledChanged}
          />
          <p className="settings-description">
            {t('preferences.notifications.description')}
            {this.renderNotificationHint()}
          </p>
        </div>
      </DialogContent>
    )
  }

  private onGrantNotificationPermission = async () => {
    await requestNotificationsPermission()
    this.updateNotificationsState()
  }

  private async updateNotificationsState() {
    const notificationsPermission = await getNotificationsPermission()
    this.setState({
      suggestGrantNotificationPermission:
        supportsNotificationsPermissionRequest() &&
        notificationsPermission === 'default',
      warnNotificationsDenied: notificationsPermission === 'denied',
      suggestConfigureNotifications: notificationsPermission === 'granted',
    })
  }

  private renderNotificationHint() {
    // No need to bother the user if their environment doesn't support our
    // notifications or if they've been explicitly disabled.
    if (!supportsNotifications() || !this.props.notificationsEnabled) {
      return null
    }

    const {
      suggestGrantNotificationPermission,
      warnNotificationsDenied,
      suggestConfigureNotifications,
    } = this.state

    if (suggestGrantNotificationPermission) {
      return (
        <Trans
          i18nKey="preferences.notifications.hints.grantPermission"
          components={{
            permission: (
              <LinkButton onClick={this.onGrantNotificationPermission} />
            ),
          }}
        />
      )
    }

    const notificationSettingsURL = getNotificationSettingsUrl()

    if (notificationSettingsURL === null) {
      return null
    }

    if (warnNotificationsDenied) {
      return (
        <div className="setting-hint-warning">
          <span className="warning-icon">⚠️</span>{' '}
          <Trans
            i18nKey="preferences.notifications.hints.denied"
            components={{
              settings: <LinkButton uri={notificationSettingsURL} />,
            }}
          />
        </div>
      )
    }

    const verb = suggestConfigureNotifications
      ? t('preferences.notifications.configureStates.properlyConfigured')
      : t('preferences.notifications.configureStates.enabled')

    return (
      <Trans
        i18nKey="preferences.notifications.hints.configure"
        values={{ state: verb }}
        components={{
          settings: <LinkButton uri={notificationSettingsURL} />,
        }}
      />
    )
  }
}
