import * as React from 'react'
import { Dispatcher } from '../dispatcher'
import { DialogFooter, DialogContent, Dialog } from '../dialog'
import { t, platformT } from '../../lib/i18n'
import { FetchType } from '../../models/fetch'
import { Repository } from '../../models/repository'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'

interface IPushNeedsPullWarningProps {
  readonly dispatcher: Dispatcher
  readonly repository: Repository
  readonly onDismissed: () => void
}

interface IPushNeedsPullWarningState {
  readonly isLoading: boolean
}

export class PushNeedsPullWarning extends React.Component<
  IPushNeedsPullWarningProps,
  IPushNeedsPullWarningState
> {
  public constructor(props: IPushNeedsPullWarningProps) {
    super(props)

    this.state = {
      isLoading: false,
    }
  }

  public render() {
    return (
      <Dialog
        title={platformT('dialogs.pushNeedsPull.title')}
        dismissDisabled={this.state.isLoading}
        disabled={this.state.isLoading}
        onDismissed={this.props.onDismissed}
        onSubmit={this.onFetch}
        loading={this.state.isLoading}
        type="warning"
      >
        <DialogContent>
          <p>
            {t('dialogs.pushNeedsPull.message')}
          </p>
        </DialogContent>
        <DialogFooter>
          <OkCancelButtonGroup
            okButtonText={t('dialogs.pushNeedsPull.fetch')}
            okButtonDisabled={this.state.isLoading}
          />
        </DialogFooter>
      </Dialog>
    )
  }

  private onFetch = async () => {
    this.setState({ isLoading: true })
    await this.props.dispatcher.fetch(
      this.props.repository,
      FetchType.UserInitiatedTask
    )
    this.setState({ isLoading: false })
    this.props.onDismissed()
  }
}
