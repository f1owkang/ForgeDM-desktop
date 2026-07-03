import React from 'react'
import { parseRepositoryIdentifier } from '../../lib/remote-parsing'
import { ISubmoduleDiff } from '../../models/diff'
import { LinkButton } from '../lib/link-button'
import { Octicon } from '../octicons'
import * as octicons from '../octicons/octicons.generated'
import { SuggestedAction } from '../suggested-actions'
import { Ref } from '../lib/ref'
import { CopyButton } from '../copy-button'
import { shortenSHA } from '../../models/commit'
import { t, platformT } from '../../lib/i18n'

type SubmoduleItemIcon =
  | {
      readonly octicon: typeof octicons.info
      readonly className: 'info-icon'
    }
  | {
      readonly octicon: typeof octicons.diffModified
      readonly className: 'modified-icon'
    }
  | {
      readonly octicon: typeof octicons.diffAdded
      readonly className: 'added-icon'
    }
  | {
      readonly octicon: typeof octicons.diffRemoved
      readonly className: 'removed-icon'
    }
  | {
      readonly octicon: typeof octicons.fileDiff
      readonly className: 'untracked-icon'
    }

interface ISubmoduleDiffProps {
  readonly onOpenSubmodule?: (fullPath: string) => void
  readonly diff: ISubmoduleDiff

  /**
   * Whether the diff is readonly, e.g., displaying a historical diff, or the
   * diff's content can be committed, e.g., displaying a change in the working
   * directory.
   */
  readonly readOnly: boolean
}

export class SubmoduleDiff extends React.Component<ISubmoduleDiffProps> {
  public constructor(props: ISubmoduleDiffProps) {
    super(props)
  }

  public render() {
    return (
      <div className="changes-interstitial submodule-diff">
        <div className="content">
          <div className="interstitial-header">
            <div className="text">
              <h1>{t('submodule.changes')}</h1>
            </div>
          </div>
          {this.renderSubmoduleInfo()}
          {this.renderCommitChangeInfo()}
          {this.renderSubmodulesChangesInfo()}
          {this.renderOpenSubmoduleAction()}
        </div>
      </div>
    )
  }

  private renderSubmoduleInfo() {
    if (this.props.diff.url === null) {
      return null
    }

    const repoIdentifier = parseRepositoryIdentifier(this.props.diff.url)
    if (repoIdentifier === null) {
      return null
    }

    const hostname =
      repoIdentifier.hostname === 'github.com'
        ? ''
        : ` (${repoIdentifier.hostname})`

    return this.renderSubmoduleDiffItem(
      { octicon: octicons.info, className: 'info-icon' },
      <>
        {t('submodule.basedOnRepo')}{' '}
        <LinkButton
          uri={`https://${repoIdentifier.hostname}/${repoIdentifier.owner}/${repoIdentifier.name}`}
        >
          {repoIdentifier.owner}/{repoIdentifier.name}
          {hostname}
        </LinkButton>
        .
      </>
    )
  }

  private renderCommitChangeInfo() {
    const { diff, readOnly } = this.props
    const { oldSHA, newSHA } = diff

    const verb = readOnly ? t('submodule.was') : t('submodule.hasBeen')
    const suffix = readOnly
      ? ''
      : ` ${t('submodule.canBeCommitted')}`

    if (oldSHA !== null && newSHA !== null) {
      return this.renderSubmoduleDiffItem(
        { octicon: octicons.diffModified, className: 'modified-icon' },
        <>
          {t('submodule.changedFrom')}{' '}
          {this.renderCommitSHA(oldSHA, 'previous')}{' '}
          {this.renderCommitSHA(newSHA, 'new')}.{suffix}
        </>
      )
    } else if (oldSHA === null && newSHA !== null) {
      return this.renderSubmoduleDiffItem(
        { octicon: octicons.diffAdded, className: 'added-icon' },
        <>
          {t('submodule.added', { verb })}{' '}
          {this.renderCommitSHA(newSHA)}.{suffix}
        </>
      )
    } else if (oldSHA !== null && newSHA === null) {
      return this.renderSubmoduleDiffItem(
        { octicon: octicons.diffRemoved, className: 'removed-icon' },
        <>
          {t('submodule.removed', { verb })}{' '}
          {this.renderCommitSHA(oldSHA)}.{suffix}
        </>
      )
    }

    return null
  }

  private renderCommitSHA(sha: string, which?: 'previous' | 'new') {
    const whichLabel = which === 'previous' ? t('submodule.previousLabel') : which === 'new' ? t('submodule.newLabel') : ''

    return (
      <>
        <Ref>{shortenSHA(sha)}</Ref>
        <CopyButton
          ariaLabel={which ? t('submodule.copyShaWithInfix', { infix: whichLabel }) : t('submodule.copySha')}
          copyContent={sha}
        />
      </>
    )
  }

  private renderSubmodulesChangesInfo() {
    const { diff } = this.props

    if (!diff.status.untrackedChanges && !diff.status.modifiedChanges) {
      return null
    }

    const changes =
      diff.status.untrackedChanges && diff.status.modifiedChanges
        ? t('submodule.modifiedAndUntracked')
        : diff.status.untrackedChanges
        ? t('submodule.untracked')
        : t('submodule.modified')

    return this.renderSubmoduleDiffItem(
      { octicon: octicons.fileDiff, className: 'untracked-icon' },
      <>
        {t('submodule.submoduleHasChanges', { changes })}
      </>
    )
  }

  private renderSubmoduleDiffItem(
    icon: SubmoduleItemIcon,
    content: React.ReactElement
  ) {
    return (
      <div className="item">
        <Octicon symbol={icon.octicon} className={icon.className} />
        <div className="content">{content}</div>
      </div>
    )
  }

  private renderOpenSubmoduleAction() {
    // If no url is found for the submodule, it means it can't be opened
    // This happens if the user is looking at an old commit which references
    // a submodule that got later deleted.
    if (this.props.diff.url === null) {
      return null
    }

    return (
      <span>
        <SuggestedAction
          title={t('submodule.openTitle')}
          description={t('submodule.openDescription')}
          buttonText={platformT('submodule.openButton')}
          type="primary"
          onClick={this.onOpenSubmoduleClick}
        />
      </span>
    )
  }

  private onOpenSubmoduleClick = () => {
    this.props.onOpenSubmodule?.(this.props.diff.fullPath)
  }
}
