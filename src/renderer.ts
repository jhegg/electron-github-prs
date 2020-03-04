import './index.css'
import { GitHub } from './github'

const githubOrgName = 'jhegg'

const github: GitHub = new GitHub()

const getReposForUser = async (): Promise<void> => {
  const reposSelectElement = document.getElementById('repo-select')
  const repoNames = await github.getRepoNamesFor(githubOrgName)
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
  const pulls = await github.getPullRequestsFor(githubOrgName, repo)
  document.getElementById('numberOfPulls').textContent = `${pulls.length}`
  pulls.forEach(pullRequest => {
    const detailDiv = document.createElement('div')
    detailDiv.innerHTML = `#${pullRequest.number} - ${pullRequest.title} - ${pullRequest.author}<br>`
    const pullsDiv = document.getElementById('pulls')
    pullsDiv.appendChild(detailDiv)
  })
}

document.getElementById('testButton').onclick = getPullRequests
