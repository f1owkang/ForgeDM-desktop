import * as React from 'react'
import { Button } from '../lib/button'
import { Octicon } from '../octicons'
import * as octicons from '../octicons/octicons.generated'
import { Dispatcher } from '../dispatcher'
import { PopupType } from '../../models/popup'
import { getLastInstance } from '../../lib/forgedm/instance-history'
import { t } from '../../lib/i18n'

interface IForgeOnboardingCardProps {
  readonly dispatcher: Dispatcher

  /**
   * Dismisses the welcome wizard (with exit animation) before the clone
   * dialog is raised.
   */
  readonly onDismissWelcome: () => void
}

/**
 * ForgeDM onboarding card (L0): shown in the welcome flow so
 * non-programmers can go straight to their company's private server
 * instead of the GitHub.com sign-in flow.
 */
export class ForgeOnboardingCard extends React.Component<
  IForgeOnboardingCardProps,
  {}
> {
  public render() {
    return (
      <div className="forgedm-onboarding-card">
        <Octicon symbol={octicons.server} />
        <div className="forgedm-onboarding-copy">
          <p className="forgedm-onboarding-title">
            {t('forge.onboarding.title')}
          </p>
          <p className="forgedm-onboarding-body">
            {t('forge.onboarding.body')}
          </p>
        </div>
        <Button onClick={this.connect} className="button-with-icon">
          {t('forge.onboarding.connect')}
          <Octicon symbol={octicons.arrowRight} />
        </Button>
      </div>
    )
  }

  private connect = () => {
    const instance = getLastInstance()
    this.props.onDismissWelcome()
    // Raise the clone dialog once the welcome exit animation has finished.
    window.setTimeout(() => {
      this.props.dispatcher.showPopup({
        type: PopupType.CloneRepository,
        initialURL: instance === null ? null : `${instance}/`,
      })
    }, 400)
  }
}
