import './index.css'
import '../node_modules/material-components-web/dist/material-components-web.css'
import 'material-design-icons/iconfont/material-icons.css'
import 'typeface-roboto'
import { MDCRipple } from '@material/ripple'
import { MDCSelect } from '@material/select'
import { MDCTextField } from '@material/textfield'
import { GitHub } from './github'
import { PullRequestCard } from './pull-request-card'
import {
  KeytarGetAccessTokenChannel,
  KeytarSetAccessTokenChannel
} from './ipc-response'
import { keytarAccountName } from './keytar-constants'

declare global {
  interface Window {
    electron: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ipcRendererInvoke(channel: string, ...args: any): any
    }
  }
}

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

const getPullRequests = async (): Promise<void> => {
  clearPullRequestData()
  const repo = document
    .getElementById('selected-repo')
    .getAttribute('value') as string
  const pulls = await github.getPullRequestsFor(githubOrgName, repo)
  document.getElementById('numberOfPulls').textContent = `${pulls.length}`
  const pullsDiv = document.getElementById('pulls')
  pulls.forEach(pullRequest => {
    const cardDiv = new PullRequestCard(pullRequest)
    pullsDiv.appendChild(cardDiv.getCard())
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

async function useAccessToken(accessToken: string): Promise<void> {
  setAccessTokenInputErrorMessage('')
  await github.setAuthToken(accessToken)
  try {
    const authenticatedUser = await github.testAuthentication()
    const authenticatedUserElement = document.getElementById(
      'authenticatedUser'
    )
    authenticatedUserElement.textContent = `Authenticated as: ${authenticatedUser}`
    await window.electron.ipcRendererInvoke(
      KeytarSetAccessTokenChannel,
      keytarAccountName,
      accessToken
    )
    getReposForUser()
  } catch (error) {
    clearAllData(error)
  }
}

const saveAccessToken = async (): Promise<void> => {
  const accessToken = (document.getElementById(
    'accessTokenInput'
  ) as HTMLInputElement).value.trim()

  if (accessToken && accessToken.length > 0) {
    await useAccessToken(accessToken)
  } else {
    clearAllData('Error: access token was not set')
  }
}

document.getElementById('saveAccessTokenButton').onclick = saveAccessToken

async function loadAccessToken(): Promise<void> {
  const accessToken = await window.electron.ipcRendererInvoke(
    KeytarGetAccessTokenChannel,
    keytarAccountName
  )
  if (accessToken) {
    new MDCTextField(
      document.getElementById('mdcAccessTokenInput')
    ).value = accessToken
    useAccessToken(accessToken)
  }
}

loadAccessToken()

// // Example of IPC invoke on main process
// async function getStuff(): Promise<void> {
//   const response = (await window.electron.ipcRendererInvoke(
//     'query-github',
//     'github'
//   )) as IpcResponse
//   if (response.error) {
//     console.log(`got error: status=${response.status}`)
//   } else {
//     console.log('got response from ipcMain...')
//     console.log(response)
//   }
// }

// getStuff()
