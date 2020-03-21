import {
  GithubResponse,
  GitHubGetReposForUserChannel,
  GitHubSaveTokenChannel,
  GitHubTestAuthenticationChannel,
  GitHubGetPullsForRepoChannel
} from './ipc-response'

export class PullRequest {
  number: number
  author: string
  title: string
  creationDate: string
  mergeCommit: string
  mergeDate: string
  htmlUrl: string

  constructor(
    number: number,
    author: string,
    title: string,
    creationDate: string,
    mergeCommit: string,
    mergeDate: string,
    htmlUrl: string
  ) {
    this.number = number
    this.author = author
    this.title = title
    this.creationDate = creationDate
    this.mergeCommit = mergeCommit
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
  async getRepoNamesFor(user: string): Promise<Array<string>> {
    const response = (await window.electron.ipcRendererInvoke(
      GitHubGetReposForUserChannel,
      user
    )) as GithubResponse
    if (response.error) {
      throw Error(`${response.status} ${response.data}`)
    }
    return response.data
  }

  async getPullRequestsFor(
    user: string,
    repoName: string
  ): Promise<Array<PullRequest>> {
    console.log(`Going to get pull requests for repo: ${repoName}`)
    const response = await window.electron.ipcRendererInvoke(
      GitHubGetPullsForRepoChannel,
      user,
      repoName
    )
    if (response.error) {
      throw Error(`${response.status} ${response.data}`)
    }
    const pulls = response.data
    console.log(`Found ${pulls.length} pull requests`)
    return pulls
  }

  async setAuthToken(accessToken: string): Promise<void> {
    await window.electron.ipcRendererInvoke(GitHubSaveTokenChannel, accessToken)
  }

  async testAuthentication(): Promise<string> {
    const authenticatedUserResponse = (await window.electron.ipcRendererInvoke(
      GitHubTestAuthenticationChannel
    )) as GithubResponse
    if (authenticatedUserResponse.error) {
      throw Error(
        `${authenticatedUserResponse.status} ${authenticatedUserResponse.data}`
      )
    }
    console.log(`Authenticated user: ${authenticatedUserResponse.data.login}`)
    const minutesUntilReset = Math.round(
      (new Date(
        Number(authenticatedUserResponse.headers['x-ratelimit-reset']) * 1000
      ).valueOf() -
        new Date().valueOf()) /
        1000 /
        60
    )
    console.log(
      `Rate limiting:
        limit=${authenticatedUserResponse.headers['x-ratelimit-limit']},
        remaining=${authenticatedUserResponse.headers['x-ratelimit-remaining']},
        reset=${new Date(
          Number(authenticatedUserResponse.headers['x-ratelimit-reset']) * 1000
        )},
        minutesUntilReset=${minutesUntilReset}`
    )
    return authenticatedUserResponse.data.login
  }
}
