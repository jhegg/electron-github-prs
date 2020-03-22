import { PullRequest } from './github'
import { ElectronOpenExternalUrlChannel } from './ipc-response'

export class PullRequestCard {
  pullRequest: PullRequest

  constructor(pullRequest: PullRequest) {
    this.pullRequest = pullRequest
  }

  private createPrimary(): HTMLDivElement {
    const primaryDiv = document.createElement('div')
    primaryDiv.className = 'pullRequestCard__primary'

    const title = document.createElement('h6')
    title.className =
      'pullRequestCard__title mdc-typography mdc-typography--headline6'
    title.textContent = `#${this.pullRequest.number} - ${this.pullRequest.title}`
    primaryDiv.appendChild(title)

    const subtitle = document.createElement('h3')
    subtitle.className =
      'pullRequestCard__subtitle mdc-typography mdc-typography--subtitle2'
    subtitle.textContent = `by ${this.pullRequest.author}`
    primaryDiv.appendChild(subtitle)

    return primaryDiv
  }

  private createSecondary(): HTMLDivElement {
    const secondaryDiv = document.createElement('div')
    secondaryDiv.className =
      'pullRequestCard__secondary mdc-typography mdc-typography--body2'

    const secondaryItemList = document.createElement('ul')
    secondaryDiv.appendChild(secondaryItemList)

    const creationDateItem = document.createElement('li')
    creationDateItem.textContent = `Created: ${this.pullRequest.creationDate}`
    secondaryItemList.appendChild(creationDateItem)

    const mergeDateItem = document.createElement('li')
    mergeDateItem.textContent = `Merged: ${this.pullRequest.mergeDate}`
    secondaryItemList.appendChild(mergeDateItem)

    const mergeCommitItem = document.createElement('li')
    mergeCommitItem.textContent = `Merge Commit: `
    secondaryItemList.appendChild(mergeCommitItem)

    const mergeCommitTitle = document.createElement('span')
    mergeCommitTitle.setAttribute('title', this.pullRequest.mergeCommit)
    const abbreviatedCommit = this.pullRequest.mergeCommit.substr(0, 6)
    mergeCommitTitle.textContent = abbreviatedCommit
    mergeCommitItem.appendChild(mergeCommitTitle)

    return secondaryDiv
  }

  private createGithubButton(
    iconName: string,
    label: string
  ): HTMLButtonElement {
    const button = document.createElement('button')
    button.className = 'mdc-button mdc-card__action mdc-card__action--button'

    const buttonRipple = document.createElement('div')
    buttonRipple.className = 'mdc-button__ripple'
    button.appendChild(buttonRipple)

    const buttonIcon = document.createElement('i')
    buttonIcon.className = 'material-icons'
    buttonIcon.textContent = iconName
    button.appendChild(buttonIcon)

    const buttonLabel = document.createElement('span')
    buttonLabel.className = 'mdc-button__label'
    buttonLabel.textContent = label
    button.appendChild(buttonLabel)

    return button
  }

  clickGithubButton = async (): Promise<void> => {
    window.electron.ipcRendererInvoke(
      ElectronOpenExternalUrlChannel,
      this.pullRequest.htmlUrl
    )
  }

  private createActions(): HTMLDivElement {
    const actionsDiv = document.createElement('div')
    actionsDiv.className = 'mdc-card__actions'
    const githubButton = this.createGithubButton('open_in_browser', 'GitHub')
    githubButton.onclick = this.clickGithubButton
    actionsDiv.appendChild(githubButton)
    return actionsDiv
  }

  getCard(): HTMLDivElement {
    const cardDiv = document.createElement('div')
    cardDiv.className = 'mdc-card pullRequestCard'
    cardDiv.appendChild(this.createPrimary())
    cardDiv.appendChild(this.createSecondary())
    cardDiv.appendChild(this.createActions())
    return cardDiv
  }
}
