import { Octokit } from '@octokit/rest'

class PullRequest {
  number: number
  author: string
  title: string

  constructor(number: number, author: string, title: string) {
    this.number = number
    this.author = author
    this.title = title
  }
}

export class GitHub {
  octokit = new Octokit()

  async getRepoNamesFor(user: string): Promise<Array<string>> {
    const repos = await this.octokit.repos.listForUser({
      username: user,
      type: 'all'
    })
    console.log(`Repos query status: ${repos.status}`)
    console.log(`Number of repos: ${repos.data.length}`)
    const repoNames = repos.data.map((repo: { name: string }) => repo.name)
    return repoNames.sort()
  }

  async getPullRequestsFor(
    user: string,
    repoName: string
  ): Promise<Array<PullRequest>> {
    console.log(`Going to get pull requests for repo: ${repoName}`)
    const pulls = await this.octokit.pulls.list({
      owner: user,
      repo: repoName,
      state: 'all'
    })
    console.log(`Pulls query status: ${pulls.status}`)
    const pullRequests = pulls.data.map(
      pull => new PullRequest(pull.number, pull.user.login, pull.title)
    )
    return pullRequests
  }

  setAuthToken(accessToken: string): void {
    this.octokit = new Octokit({
      auth: accessToken,
      userAgent: 'jhegg/electron-github-prs 1.0.0'
    })
  }

  async testAuthentication(): Promise<string> {
    const authenticatedUser = await this.octokit.users.getAuthenticated()
    console.log(`Authenticated user: ${authenticatedUser.data.login}`)
    return authenticatedUser.data.login
  }
}
