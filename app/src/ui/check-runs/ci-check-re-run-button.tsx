import * as React from 'react'
import { APICheckConclusion } from '../../lib/api'
import { IRefCheck } from '../../lib/ci-checks/ci-checks'
import { IMenuItem, showContextualMenu } from '../../lib/menu-item'
import { Button } from '../lib/button'
import { t, platformT } from '../../lib/i18n'
import { Octicon, syncClockwise } from '../octicons'
import * as octicons from '../octicons/octicons.generated'

interface ICICheckReRunButtonProps {
  readonly disabled: boolean
  readonly checkRuns: ReadonlyArray<IRefCheck>
  readonly canReRunFailed: boolean
  readonly onRerunChecks: (failedOnly: boolean) => void
}

export class CICheckReRunButton extends React.PureComponent<ICICheckReRunButtonProps> {
  private get failedChecksExist() {
    return this.props.checkRuns.some(
      cr => cr.conclusion === APICheckConclusion.Failure
    )
  }

  private onRerunChecks = () => {
    if (!this.props.canReRunFailed || !this.failedChecksExist) {
      this.props.onRerunChecks(false)
      return
    }

    const items: IMenuItem[] = [
      {
        label: platformT('dialogs.ciChecks.reRunFailedChecks'),
        action: () => this.props.onRerunChecks(true),
      },
      {
        label: platformT('dialogs.ciChecks.reRunAllChecks'),
        action: () => this.props.onRerunChecks(false),
      },
    ]

    showContextualMenu(items)
  }

  private onRerunKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!this.props.canReRunFailed || !this.failedChecksExist) {
      return
    }

    if (event.key === 'ArrowDown') {
      this.onRerunChecks()
    }
  }

  public render() {
    const text =
      this.props.canReRunFailed && this.failedChecksExist ? (
        <>
          {t('dialogs.ciChecks.reRun')}{' '}
          <Octicon symbol={octicons.triangleDown} />
        </>
      ) : (
        t('dialogs.ciChecks.reRunChecks')
      )
    return (
      <Button
        onClick={this.onRerunChecks}
        onKeyDown={this.onRerunKeyDown}
        disabled={this.props.disabled}
      >
        <Octicon symbol={syncClockwise} /> {text}
      </Button>
    )
  }
}
