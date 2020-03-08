import { PullRequest } from './github'

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

    return secondaryDiv
  }

  private createActionButton(
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

  private createActions(): HTMLDivElement {
    const actionsDiv = document.createElement('div')
    actionsDiv.className = 'mdc-card__actions'
    actionsDiv.appendChild(this.createActionButton('open_in_browser', 'GitHub'))
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
