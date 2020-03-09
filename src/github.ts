import { Octokit } from '@octokit/rest'

export class PullRequest {
  number: number
  author: string
  title: string
  creationDate: string
  mergeDate: string
  htmlUrl: string

  constructor(
    number: number,
    author: string,
    title: string,
    creationDate: string,
    mergeDate: string,
    htmlUrl: string
  ) {
    this.number = number
    this.author = author
    this.title = title
    this.creationDate = creationDate
    this.mergeDate = mergeDate

    this.htmlUrl = this.validateUrl(htmlUrl)
  }

  private validateUrl(htmlUrl: string): string {
    try {
      const url = new URL(htmlUrl)
      if (url.protocol !== 'https:') {
        console.log(
          `Error while parsing URL "${htmlUrl}" for PR from GitHub: protocol was not "https:"`
        )
        return ''
      }
      return htmlUrl
    } catch (error) {
      console.log(
        `Error while parsing URL "${htmlUrl}" for PR from GitHub: ${error}`
      )
      return ''
    }
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
      pull =>
        new PullRequest(
          pull.number,
          pull.user.login,
          pull.title,
          pull.created_at,
          pull.merged_at,
          pull.html_url
        )
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
