import * as React from 'react'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { t, platformT } from '../../lib/i18n'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'

interface IAttributeMismatchProps {
  /** Called when the dialog should be dismissed. */
  readonly onDismissed: () => void

  /** Called when the user has chosen to replace the update filters. */
  readonly onUpdateExistingFilters: () => void

  readonly onEditGlobalGitConfig: () => void
}

export class AttributeMismatch extends React.Component<IAttributeMismatchProps> {
  public render() {
    return (
      <Dialog
        id="lfs-attribute-mismatch"
        title={platformT('dialogs.lfsAttributeMismatch.title')}
        onDismissed={this.props.onDismissed}
        onSubmit={this.onSubmit}
      >
        <DialogContent>
          <p>{t('dialogs.lfsAttributeMismatch.message')}</p>
        </DialogContent>

        <DialogFooter>
          <OkCancelButtonGroup
            okButtonText={platformT('dialogs.lfsAttributeMismatch.okButton')}
            cancelButtonText={platformT(
              'dialogs.lfsAttributeMismatch.cancelButton'
            )}
          />
        </DialogFooter>
      </Dialog>
    )
  }

  private onSubmit = () => {
    this.props.onUpdateExistingFilters()
    this.props.onDismissed()
  }
}
