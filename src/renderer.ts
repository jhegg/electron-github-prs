/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css'
import { Octokit } from '@octokit/rest'

const octokit = new Octokit()
const githubOrgName = 'jhegg'

const getReposForUser = async (): Promise<void> => {
  const repos = await octokit.repos.listForUser({
    username: githubOrgName,
    type: 'all'
  })
  console.log(`Repos query status: ${repos.status}`)
  console.log(`Number of repos: ${repos.data.length}`)
  const repoNames = repos.data.map((repo: { name: string }) => repo.name)
  repoNames.sort()
  const reposSelectElement = document.getElementById('repo-select')
  repoNames.forEach((repoName: string) => {
    const option = document.createElement('option')
    option.textContent = repoName
    reposSelectElement.appendChild(option)
  })
  reposSelectElement.removeAttribute('disabled')
  reposSelectElement.focus()
}

getReposForUser()

function clearData(): void {
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
    document.getElementById('testButton').removeAttribute('disabled')
  } else {
    document.getElementById('testButton').setAttribute('disabled', '')
  }
  clearData()
}

const getPullRequests = async (): Promise<void> => {
  const repo = document
    .getElementById('selected-repo')
    .getAttribute('value') as string
  console.log(`Going to get pull requests for repo: ${repo}`)
  const pulls = await octokit.pulls.list({
    owner: githubOrgName,
    repo: repo,
    state: 'all'
  })
  console.log(`Pulls query status: ${pulls.status}`)
  document.getElementById('numberOfPulls').textContent = `${pulls.data.length}`
  pulls.data.forEach(pullRequest => {
    const detailDiv = document.createElement('div')
    detailDiv.innerHTML = `#${pullRequest.number} - ${pullRequest.title} - ${pullRequest.user.login}<br>`
    const pullsDiv = document.getElementById('pulls')
    pullsDiv.appendChild(detailDiv)
  })
}

document.getElementById('testButton').onclick = getPullRequests
