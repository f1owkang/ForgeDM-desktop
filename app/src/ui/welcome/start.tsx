import * as React from 'react'
import { WelcomeStep } from './welcome'
import { LinkButton } from '../lib/link-button'
import { Dispatcher } from '../dispatcher'
import { Octicon } from '../octicons'
import * as octicons from '../octicons/octicons.generated'
import { Button } from '../lib/button'
import { Loading } from '../lib/loading'
import { BrowserRedirectMessage } from '../lib/authentication-form'
import { SamplesURL } from '../../lib/stats'
import { t } from '../../lib/i18n'

/**
 * The URL to the sign-up page on GitHub.com. Used in conjunction
 * with account actions in the app where the user might want to
 * consider signing up.
 */
export const CreateAccountURL = 'https://github.com/join?source=github-desktop'

interface IStartProps {
  readonly advance: (step: WelcomeStep) => void
  readonly dispatcher: Dispatcher
  readonly loadingBrowserAuth: boolean
}

/** The first step of the Welcome flow. */
export class Start extends React.Component<IStartProps, {}> {
  public render() {
    return (
      <section
        id="start"
        aria-label={t('welcome.start.ariaLabel')}
        aria-describedby="start-description"
      >
        <div className="start-content">
          <h1 className="welcome-title">
            {t('welcome.start.titlePrefix')}{' '}
            <span>{t('welcome.start.titleProduct')}</span>
          </h1>
          {!this.props.loadingBrowserAuth ? (
            <>
              <p id="start-description" className="welcome-text">
                {t('welcome.start.description')}
              </p>
            </>
          ) : (
            <p>{BrowserRedirectMessage}</p>
          )}

          <div className="welcome-main-buttons">
            <Button
              type="submit"
              className="button-with-icon"
              disabled={this.props.loadingBrowserAuth}
              onClick={this.signInWithBrowser}
              autoFocus={true}
              role="link"
            >
              {this.props.loadingBrowserAuth && <Loading />}
              {t('welcome.start.signInGitHub')}
              <Octicon symbol={octicons.linkExternal} />
            </Button>
            {this.props.loadingBrowserAuth ? (
              <Button onClick={this.cancelBrowserAuth}>
                {t('common.cancel')}
              </Button>
            ) : (
              <Button onClick={this.signInToEnterprise}>
                {t('welcome.start.signInEnterprise')}
              </Button>
            )}
          </div>
          <div className="skip-action-container">
            <p className="welcome-text">
              {t('welcome.start.newToGitHub')}{' '}
              <LinkButton
                uri={CreateAccountURL}
                className="create-account-link"
              >
                {t('welcome.start.createAccount')}
              </LinkButton>
            </p>
            <LinkButton className="skip-button" onClick={this.skip}>
              {t('welcome.start.skip')}
            </LinkButton>
          </div>
        </div>

        <div className="start-footer">
          <p>
            {t('welcome.start.termsPrefix')}{' '}
            <LinkButton uri={'https://github.com/site/terms'}>
              {t('welcome.start.terms')}
            </LinkButton>
            {t('welcome.start.privacyPrefix')}{' '}
            <LinkButton uri={'https://github.com/site/privacy'}>
              {t('welcome.start.privacy')}
            </LinkButton>
          </p>
          <p>
            {t('welcome.start.metrics')}{' '}
            <LinkButton uri={SamplesURL}>
              {t('welcome.start.metricsLink')}
            </LinkButton>
          </p>
        </div>
      </section>
    )
  }

  private signInWithBrowser = (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) {
      event.preventDefault()
    }

    this.props.advance(WelcomeStep.SignInToDotComWithBrowser)
    this.props.dispatcher.requestBrowserAuthenticationToDotcom()
  }

  private cancelBrowserAuth = () => {
    this.props.advance(WelcomeStep.Start)
  }

  private signInToEnterprise = () => {
    this.props.advance(WelcomeStep.SignInToEnterprise)
  }

  private skip = () => {
    this.props.advance(WelcomeStep.ConfigureGit)
  }
}
