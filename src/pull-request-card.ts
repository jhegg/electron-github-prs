import { PullRequest } from './github'

export function createPullRequestCard(
  pullRequest: PullRequest
): HTMLDivElement {
  const cardDiv = document.createElement('div')
  cardDiv.className = 'mdc-card pullRequestCard'

  const primaryDiv = document.createElement('div')
  primaryDiv.className = 'pullRequestCard__primary'
  cardDiv.appendChild(primaryDiv)

  const title = document.createElement('h6')
  title.className =
    'pullRequestCard__title mdc-typography mdc-typography--headline6'
  title.textContent = `#${pullRequest.number} - ${pullRequest.title}`
  primaryDiv.appendChild(title)

  const subtitle = document.createElement('h3')
  subtitle.className =
    'pullRequestCard__subtitle mdc-typography mdc-typography--subtitle2'
  subtitle.textContent = `by ${pullRequest.author}`
  primaryDiv.appendChild(subtitle)

  const secondaryDiv = document.createElement('div')
  secondaryDiv.className =
    'pullRequestCard__secondary mdc-typography mdc-typography--body2'
  cardDiv.appendChild(secondaryDiv)

  const secondaryItemList = document.createElement('ul')
  secondaryDiv.appendChild(secondaryItemList)

  const creationDateItem = document.createElement('li')
  creationDateItem.textContent = `Created: ${pullRequest.creationDate}`
  secondaryItemList.appendChild(creationDateItem)

  const mergeDateItem = document.createElement('li')
  mergeDateItem.textContent = `Merged: ${pullRequest.mergeDate}`
  secondaryItemList.appendChild(mergeDateItem)

  const actionsDiv = document.createElement('div')
  actionsDiv.className = 'mdc-card__actions'
  cardDiv.appendChild(actionsDiv)

  const githubButton = document.createElement('button')
  githubButton.className =
    'mdc-button mdc-card__action mdc-card__action--button'
  actionsDiv.appendChild(githubButton)

  const githubButtonRipple = document.createElement('div')
  githubButtonRipple.className = 'mdc-button__ripple'
  githubButton.appendChild(githubButtonRipple)

  const githubButtonIcon = document.createElement('i')
  githubButtonIcon.className = 'material-icons'
  githubButtonIcon.textContent = 'open_in_browser'
  githubButton.appendChild(githubButtonIcon)

  const githubButtonLabel = document.createElement('span')
  githubButtonLabel.className = 'mdc-button__label'
  githubButtonLabel.textContent = 'GitHub'
  githubButton.appendChild(githubButtonLabel)

  return cardDiv
}
