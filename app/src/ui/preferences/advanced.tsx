import * as React from 'react'
import { Trans } from 'react-i18next'
import { DialogContent } from '../dialog'
import { Checkbox, CheckboxValue } from '../lib/checkbox'
import { LinkButton } from '../lib/link-button'
import { SamplesURL } from '../../lib/stats'
import { isWindowsOpenSSHAvailable } from '../../lib/ssh/ssh'
import { t } from '../../lib/i18n'

interface IAdvancedPreferencesProps {
  readonly useWindowsOpenSSH: boolean
  readonly optOutOfUsageTracking: boolean
  readonly useExternalCredentialHelper: boolean
  readonly repositoryIndicatorsEnabled: boolean
  readonly onUseWindowsOpenSSHChanged: (checked: boolean) => void
  readonly onOptOutofReportingChanged: (checked: boolean) => void
  readonly onUseExternalCredentialHelperChanged: (checked: boolean) => void
  readonly onRepositoryIndicatorsEnabledChanged: (enabled: boolean) => void
}

interface IAdvancedPreferencesState {
  readonly optOutOfUsageTracking: boolean
  readonly canUseWindowsSSH: boolean
  readonly useExternalCredentialHelper: boolean
}

export class Advanced extends React.Component<
  IAdvancedPreferencesProps,
  IAdvancedPreferencesState
> {
  public constructor(props: IAdvancedPreferencesProps) {
    super(props)

    this.state = {
      optOutOfUsageTracking: this.props.optOutOfUsageTracking,
      canUseWindowsSSH: false,
      useExternalCredentialHelper: this.props.useExternalCredentialHelper,
    }
  }

  public componentDidMount() {
    this.checkSSHAvailability()
  }

  private async checkSSHAvailability() {
    this.setState({ canUseWindowsSSH: await isWindowsOpenSSHAvailable() })
  }

  private onReportingOptOutChanged = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    const value = !event.currentTarget.checked

    this.setState({ optOutOfUsageTracking: value })
    this.props.onOptOutofReportingChanged(value)
  }

  private onUseExternalCredentialHelperChanged = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    const value = event.currentTarget.checked

    this.setState({ useExternalCredentialHelper: value })
    this.props.onUseExternalCredentialHelperChanged(value)
  }

  private onRepositoryIndicatorsEnabledChanged = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    this.props.onRepositoryIndicatorsEnabledChanged(event.currentTarget.checked)
  }

  private onUseWindowsOpenSSHChanged = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    this.props.onUseWindowsOpenSSHChanged(event.currentTarget.checked)
  }

  private reportDesktopUsageLabel() {
    return (
      <Trans
        i18nKey="preferences.advanced.usage.reportStats"
        components={{ stats: <LinkButton uri={SamplesURL} /> }}
      />
    )
  }

  public render() {
    return (
      <DialogContent>
        <div className="advanced-section">
          <h2>{t('preferences.advanced.backgroundUpdates.heading')}</h2>
          <Checkbox
            label={t(
              'preferences.advanced.backgroundUpdates.repositoryIndicators'
            )}
            value={
              this.props.repositoryIndicatorsEnabled
                ? CheckboxValue.On
                : CheckboxValue.Off
            }
            onChange={this.onRepositoryIndicatorsEnabledChanged}
            ariaDescribedBy="periodic-fetch-description"
          />
          <div id="periodic-fetch-description" className="settings-description">
            <p>
              {t('preferences.advanced.backgroundUpdates.descriptionPrimary')}
            </p>
            <p>
              {t('preferences.advanced.backgroundUpdates.descriptionSecondary')}
            </p>
          </div>
        </div>
        <div className="advanced-section">
          <h2>{t('preferences.advanced.usage.heading')}</h2>
          <Checkbox
            label={this.reportDesktopUsageLabel()}
            value={
              this.state.optOutOfUsageTracking
                ? CheckboxValue.Off
                : CheckboxValue.On
            }
            onChange={this.onReportingOptOutChanged}
          />
        </div>
        <h2>{t('preferences.advanced.network.heading')}</h2>
        {this.renderSSHSettings()}
        <div className="advanced-section">
          <Checkbox
            label={t('preferences.advanced.network.useGitCredentialManager')}
            value={
              this.state.useExternalCredentialHelper
                ? CheckboxValue.On
                : CheckboxValue.Off
            }
            onChange={this.onUseExternalCredentialHelperChanged}
            ariaDescribedBy="use-external-credential-helper-description"
          />
          <div
            id="use-external-credential-helper-description"
            className="settings-description"
          >
            <p>
              <Trans
                i18nKey="preferences.advanced.network.gitCredentialManagerDescription"
                components={{
                  gcm: <LinkButton uri="https://gh.io/gcm" />,
                }}
              />
            </p>
          </div>
        </div>
      </DialogContent>
    )
  }

  private renderSSHSettings() {
    if (!this.state.canUseWindowsSSH) {
      return null
    }

    return (
      <div className="advanced-section">
        <Checkbox
          label={t('preferences.advanced.network.useSystemOpenSSH')}
          value={
            this.props.useWindowsOpenSSH ? CheckboxValue.On : CheckboxValue.Off
          }
          onChange={this.onUseWindowsOpenSSHChanged}
        />
      </div>
    )
  }
}
