import * as React from 'react'

import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'
import { Terminal } from '../terminal'
import { t, platformT } from '../../lib/i18n'
import { TerminalOutput } from '../../lib/git'

interface IHookFailedProps {
  readonly hookName: string
  readonly terminalOutput: TerminalOutput
  readonly resolve: (value: 'abort' | 'ignore') => void
  readonly onDismissed: () => void
}

/** A component to confirm and then discard changes. */
export class HookFailed extends React.Component<IHookFailedProps> {
  private getDialogTitle() {
    return t('dialogs.hookFailed.title', { hookName: this.props.hookName, failed: platformT('dialogs.hookFailed.failed') })
  }

  private onDismissed = () => {
    this.props.resolve('abort')
    this.props.onDismissed()
  }

  private onIgnore = () => {
    this.props.resolve('ignore')
    this.props.onDismissed()
  }

  public render() {
    return (
      <Dialog
        id="hook-failed-dialog"
        title={this.getDialogTitle()}
        onDismissed={this.onDismissed}
        onSubmit={this.onIgnore}
        type="warning"
        role="alertdialog"
        ariaDescribedBy="hook-failure-message"
      >
        <DialogContent>
          <p id="hook-failure-message">
            {t('dialogs.hookFailed.message', { hookName: this.props.hookName })}
          </p>
          <Terminal
            terminalOutput={this.props.terminalOutput}
            rows={15}
            cols={80}
          />
        </DialogContent>

        <DialogFooter>
          <OkCancelButtonGroup
            destructive={true}
            okButtonText={t('dialogs.hookFailed.ignoreAndContinue')}
            cancelButtonText={t('dialogs.hookFailed.abort')}
          />
        </DialogFooter>
      </Dialog>
    )
  }
}
