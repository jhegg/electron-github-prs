import './index.css'
import '../node_modules/material-components-web/dist/material-components-web.css'
import 'material-design-icons/iconfont/material-icons.css'
import 'typeface-roboto'
import { MDCRipple } from '@material/ripple'
import { MDCSelect } from '@material/select'
import { MDCTextField } from '@material/textfield'
import { GitHub, PullRequest } from './github'

new MDCRipple(document.querySelector('.mdc-button'))
new MDCTextField(document.querySelector('.mdc-text-field'))
const repoSelector = new MDCSelect(document.querySelector('.mdc-select'))
repoSelector.disabled = true

const githubOrgName = 'jhegg'
const github: GitHub = new GitHub()

const getReposForUser = async (): Promise<void> => {
  try {
    const repoNames = await github.getRepoNamesFor(githubOrgName)
    repoNames.forEach((repoName: string) => {
      const repoItem = document.createElement('li')
      repoItem.className = 'mdc-list-item'
      repoItem.setAttribute('data-value', repoName)
      repoItem.setAttribute('role', 'option')
      repoItem.textContent = repoName
      document.getElementById('repo-item-list').appendChild(repoItem)
    })
    repoSelector.disabled = false
  } catch (error) {
    document.getElementById(
      'accessTokenInputError'
    ).textContent = `Error: ${error}`
  }
}

function clearPullRequestData(): void {
  document.getElementById('numberOfPulls').textContent = ''
  const pullsDiv = document.getElementById('pulls')
  while (pullsDiv.firstChild) {
    pullsDiv.removeChild(pullsDiv.firstChild)
  }
}

repoSelector.listen('MDCSelect:change', () => {
  document
    .getElementById('selected-repo')
    .setAttribute('value', repoSelector.value)
  if (repoSelector.value && repoSelector.value.length > 0) {
    document
      .getElementById('collectPullRequestsButton')
      .removeAttribute('disabled')
  } else {
    document
      .getElementById('collectPullRequestsButton')
      .setAttribute('disabled', '')
  }
  clearPullRequestData()
})

function createPullRequestCard(pullRequest: PullRequest): HTMLDivElement {
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

const getPullRequests = async (): Promise<void> => {
  const repo = document
    .getElementById('selected-repo')
    .getAttribute('value') as string
  const pulls = await github.getPullRequestsFor(githubOrgName, repo)
  document.getElementById('numberOfPulls').textContent = `${pulls.length}`
  const pullsDiv = document.getElementById('pulls')
  pulls.forEach(pullRequest => {
    const cardDiv = createPullRequestCard(pullRequest)
    pullsDiv.appendChild(cardDiv)
  })
}

document.getElementById('collectPullRequestsButton').onclick = getPullRequests

function clearRepoSelector(): void {
  repoSelector.selectedIndex = -1
  const repoItemList = document.getElementById('repo-item-list')
  while (repoItemList.firstChild) {
    repoItemList.removeChild(repoItemList.firstChild)
  }
  const repoItem = document.createElement('li')
  repoItem.className = 'mdc-list-item'
  repoItem.setAttribute('data-value', '')
  repoItem.setAttribute('aria-selected', 'true')
  repoItemList.appendChild(repoItem)
  repoSelector.disabled = true
}

function clearRepoData(): void {
  clearRepoSelector()
  document
    .getElementById('collectPullRequestsButton')
    .setAttribute('disabled', '')
}

function setAccessTokenInputErrorMessage(errorMessage: string): void {
  const accessTokenInputErrorElement = document.getElementById(
    'accessTokenInputError'
  )
  accessTokenInputErrorElement.textContent = errorMessage
}

function clearAllData(errorMessage: string): void {
  setAccessTokenInputErrorMessage(errorMessage)
  const authenticatedUserElement = document.getElementById('authenticatedUser')
  authenticatedUserElement.textContent = ''
  clearPullRequestData()
  clearRepoData()
}

const saveAccessToken = async (): Promise<void> => {
  const accessToken = (document.getElementById(
    'accessTokenInput'
  ) as HTMLInputElement).value.trim()
  const authenticatedUserElement = document.getElementById('authenticatedUser')

  if (accessToken && accessToken.length > 0) {
    setAccessTokenInputErrorMessage('')
    github.setAuthToken(accessToken)
    try {
      const authenticatedUser = await github.testAuthentication()
      authenticatedUserElement.textContent = `Authenticated as: ${authenticatedUser}`
      getReposForUser()
    } catch (error) {
      clearAllData(`Error: ${error}`)
    }
  } else {
    clearAllData('Error: access token was not set')
  }
}

document.getElementById('saveAccessTokenButton').onclick = saveAccessToken
