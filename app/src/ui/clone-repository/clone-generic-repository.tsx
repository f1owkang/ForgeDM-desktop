import * as React from 'react'
import { TextBox } from '../lib/text-box'
import { Button } from '../lib/button'
import { Row } from '../lib/row'
import { DialogContent } from '../dialog'
import { t, platformT } from '../../lib/i18n'
// FORGEDM-BEGIN: instance history (L1)
import {
  getInstanceHistory,
  rememberInstance,
} from '../../lib/forgedm/instance-history'
// FORGEDM-END

interface ICloneGenericRepositoryProps {
  /** The URL to clone. */
  readonly url: string

  /** The path to which the repository should be cloned. */
  readonly path: string

  /** Called when the destination path changes. */
  readonly onPathChanged: (path: string) => void

  /** Called when the URL to clone changes. */
  readonly onUrlChanged: (url: string) => void

  /**
   * Called when the user should be prompted to choose a directory to clone to.
   */
  readonly onChooseDirectory: () => Promise<string | undefined>
}

/** The component for cloning a repository. */
export class CloneGenericRepository extends React.Component<
  ICloneGenericRepositoryProps,
  // FORGEDM-BEGIN: instance history state (L1)
  { showHistory: boolean }
  // FORGEDM-END
> {
  // FORGEDM-BEGIN: instance history state (L1)
  public state = { showHistory: false }
  // FORGEDM-END

  public render() {
    return (
      <DialogContent className="clone-generic-repository-content">
        <Row>
          <TextBox
            placeholder={t('cloneGenericRepository.urlPlaceholder')}
            value={this.props.url}
            onValueChanged={this.onUrlChanged}
            autoFocus={true}
            // FORGEDM-BEGIN: instance history dropdown (L1)
            onFocus={this.onUrlFocused}
            onBlur={this.onUrlBlurred}
            // FORGEDM-END
            label={
              <div className="clone-url-textbox-label">
                <p>{t('cloneGenericRepository.urlLabel')}</p>
                <p>{t('cloneGenericRepository.urlLabelExample')}</p>
              </div>
            }
          />
        </Row>

        {/* FORGEDM-BEGIN: instance history dropdown (L1) */}
        {this.state.showHistory && this.historyEntries.length > 0 ? (
          <div className="forgedm-instance-history">
            <div className="forgedm-instance-history-label">
              {t('forge.instanceHistory.label')}
            </div>
            {this.historyEntries.map(origin => (
              <button
                key={origin}
                type="button"
                className="forgedm-instance-history-item"
                data-origin={origin}
                onMouseDown={this.onHistoryItemMouseDown}
              >
                {origin}/
              </button>
            ))}
          </div>
        ) : null}
        {/* FORGEDM-END */}

        <Row>
          <TextBox
            value={this.props.path}
            label={platformT('common.localPath')}
            placeholder={t('common.repositoryPath')}
            onValueChanged={this.props.onPathChanged}
          />
          <Button onClick={this.props.onChooseDirectory}>
            {t('common.choose')}
          </Button>
        </Row>
      </DialogContent>
    )
  }

  private get historyEntries() {
    return getInstanceHistory()
  }

  // FORGEDM-BEGIN: instance history handlers (L1)
  private onUrlFocused = () => {
    this.setState({ showHistory: true })
  }

  private onUrlBlurred = () => {
    rememberInstance(this.props.url)
    this.setState({ showHistory: false })
  }

  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  private onHistoryItemMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const origin = e.currentTarget.dataset.origin
    if (origin) {
      this.pickInstance(origin)
    }
  }

  private pickInstance = (origin: string) => {
    rememberInstance(origin)
    this.setState({ showHistory: false })
    this.props.onUrlChanged(`${origin}/`)
  }
  // FORGEDM-END

  private onUrlChanged = (url: string) => {
    this.props.onUrlChanged(url)
  }
}
