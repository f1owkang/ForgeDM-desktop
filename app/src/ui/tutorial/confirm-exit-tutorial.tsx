import * as React from 'react'

import { DialogFooter, DialogContent, Dialog } from '../dialog'
import { t, platformT } from '../../lib/i18n'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'

interface IConfirmExitTutorialProps {
  readonly onDismissed: () => void
  readonly onContinue: () => boolean
}

export class ConfirmExitTutorial extends React.Component<
  IConfirmExitTutorialProps,
  {}
> {
  public render() {
    return (
      <Dialog
        title={platformT('dialogs.confirmExitTutorial.title')}
        onDismissed={this.props.onDismissed}
        onSubmit={this.onContinue}
        type="normal"
      >
        <DialogContent>
          <p>{t('dialogs.confirmExitTutorial.message')}</p>
        </DialogContent>
        <DialogFooter>
          <OkCancelButtonGroup
            okButtonText={platformT('dialogs.confirmExitTutorial.title')}
          />
        </DialogFooter>
      </Dialog>
    )
  }

  private onContinue = () => {
    const dismissPopup = this.props.onContinue()

    if (dismissPopup) {
      this.props.onDismissed()
    }
  }
}
