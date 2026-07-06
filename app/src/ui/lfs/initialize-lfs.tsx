import * as React from 'react'
import { Repository } from '../../models/repository'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { PathText } from '../lib/path-text'
import { LinkButton } from '../lib/link-button'
import { t, platformT } from '../../lib/i18n'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'

const LFSURL = 'https://git-lfs.github.com/'

/**
 * If we're initializing any more than this number, we won't bother listing them
 * all.
 */
const MaxRepositoriesToList = 10

interface IInitializeLFSProps {
  /** The repositories in which LFS needs to be initialized. */
  readonly repositories: ReadonlyArray<Repository>

  /**
   * Event triggered when the dialog is dismissed by the user in the
   * ways described in the Dialog component's dismissable prop.
   */
  readonly onDismissed: () => void

  /**
   * Called when the user chooses to initialize LFS in the repositories.
   */
  readonly onInitialize: (repositories: ReadonlyArray<Repository>) => void
}

export class InitializeLFS extends React.Component<IInitializeLFSProps, {}> {
  public render() {
    return (
      <Dialog
        id="initialize-lfs"
        title={t('dialogs.initializeLfs.title')}
        backdropDismissable={false}
        onSubmit={this.onInitialize}
        onDismissed={this.props.onDismissed}
      >
        <DialogContent>{this.renderRepositories()}</DialogContent>

        <DialogFooter>
          <OkCancelButtonGroup
            okButtonText={t('dialogs.initializeLfs.okButton')}
            cancelButtonText={platformT('dialogs.initializeLfs.cancelButton')}
            onCancelButtonClick={this.props.onDismissed}
          />
        </DialogFooter>
      </Dialog>
    )
  }

  private onInitialize = () => {
    this.props.onInitialize(this.props.repositories)
    this.props.onDismissed()
  }

  private renderRepositories() {
    if (this.props.repositories.length > MaxRepositoriesToList) {
      return (
        <p>
          {t('dialogs.initializeLfs.manyRepos', {
            count: this.props.repositories.length,
          })}
        </p>
      )
    } else {
      const plural = this.props.repositories.length !== 1
      const pluralizedRepositories = plural
        ? t('dialogs.initializeLfs.reposUse')
        : t('dialogs.initializeLfs.repoUse')
      const pluralizedUse = plural
        ? t('dialogs.initializeLfs.toContributeThem')
        : t('dialogs.initializeLfs.toContributeIt')
      return (
        <div>
          <p>
            {pluralizedRepositories}{' '}
            <LinkButton uri={LFSURL}>Git LFS</LinkButton>. {pluralizedUse}, Git
            LFS must first be initialized. Would you like to do so now?
          </p>
          <ul>
            {this.props.repositories.map(r => (
              <li key={r.id}>
                <PathText path={r.path} />
              </li>
            ))}
          </ul>
        </div>
      )
    }
  }
}
