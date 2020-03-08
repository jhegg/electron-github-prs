import './index.css'
import '../node_modules/material-components-web/dist/material-components-web.css'
import 'material-design-icons/iconfont/material-icons.css'
import 'typeface-roboto'
import { MDCRipple } from '@material/ripple/index'
import { GitHub } from './github'

new MDCRipple(document.querySelector('.mdc-button'))

const githubOrgName = 'jhegg'
const github: GitHub = new GitHub()

const getReposForUser = async (): Promise<void> => {
  const reposSelectElement = document.getElementById('repo-select')
  try {
    const repoNames = await github.getRepoNamesFor(githubOrgName)
    repoNames.forEach((repoName: string) => {
      const option = document.createElement('option')
      option.textContent = repoName
      reposSelectElement.appendChild(option)
    })
    reposSelectElement.removeAttribute('disabled')
    reposSelectElement.focus()
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

document.getElementById('repo-select').onchange = (event): void => {
  const selectedValue = (event.target as HTMLInputElement).value
  document.getElementById('selected-repo').setAttribute('value', selectedValue)
  if (selectedValue && selectedValue.length > 0) {
    document
      .getElementById('collectPullRequestsButton')
      .removeAttribute('disabled')
  } else {
    document
      .getElementById('collectPullRequestsButton')
      .setAttribute('disabled', '')
  }
  clearPullRequestData()
}

const getPullRequests = async (): Promise<void> => {
  const repo = document
    .getElementById('selected-repo')
    .getAttribute('value') as string
  const pulls = await github.getPullRequestsFor(githubOrgName, repo)
  document.getElementById('numberOfPulls').textContent = `${pulls.length}`
  pulls.forEach(pullRequest => {
    const detailDiv = document.createElement('div')
    detailDiv.innerHTML = `#${pullRequest.number} - ${pullRequest.title} - ${pullRequest.author}<br>`
    const pullsDiv = document.getElementById('pulls')
    pullsDiv.appendChild(detailDiv)
  })
}

document.getElementById('collectPullRequestsButton').onclick = getPullRequests

function clearRepoData(): void {
  const reposSelectElement = document.getElementById('repo-select')
  reposSelectElement.setAttribute('disabled', '')
  while (reposSelectElement.firstChild) {
    reposSelectElement.removeChild(reposSelectElement.firstChild)
  }
  const defaultRepoSelectElement = document.createElement('option')
  defaultRepoSelectElement.textContent = '--Please choose a repository--'
  defaultRepoSelectElement.value = ''
  reposSelectElement.appendChild(defaultRepoSelectElement)
  document
    .getElementById('collectPullRequestsButton')
    .setAttribute('disabled', '')
}

const saveAccessToken = async (): Promise<void> => {
  const accessToken = (document.getElementById(
    'accessTokenInput'
  ) as HTMLInputElement).value.trim()
  const accessTokenInputErrorElement = document.getElementById(
    'accessTokenInputError'
  )
  const authenticatedUserElement = document.getElementById('authenticatedUser')

  if (accessToken && accessToken.length > 0) {
    accessTokenInputErrorElement.textContent = ''
    github.setAuthToken(accessToken)
    try {
      const authenticatedUser = await github.testAuthentication()
      authenticatedUserElement.textContent = `Authenticated as: ${authenticatedUser}`
      getReposForUser()
    } catch (error) {
      accessTokenInputErrorElement.textContent = `Error: ${error}`
      authenticatedUserElement.textContent = ''
      clearPullRequestData()
      clearRepoData()
    }
  } else {
    accessTokenInputErrorElement.textContent = 'Error: access token was not set'
  }
}

document.getElementById('saveAccessTokenButton').onclick = saveAccessToken
