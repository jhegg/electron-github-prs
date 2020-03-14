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

interface Repo {
  name: string
}

interface Pull {
  number: number
  user: {
    login: string
  }
  title: string
  created_at: string
  merged_at: string
  html_url: string
}

export class GitHub {
  octokit = new Octokit()

  async getRepoNamesFor(user: string): Promise<Array<string>> {
    const repoNames = (await this.octokit.paginate(
      'GET /users/:owner/repos',
      {
        owner: user,
        type: 'all',
        // eslint-disable-next-line @typescript-eslint/camelcase
        per_page: 100
      },
      response => (response.data as Array<Repo>).map(repo => repo.name)
    )) as Array<string>
    return repoNames.sort()
  }

  async getPullRequestsFor(
    user: string,
    repoName: string
  ): Promise<Array<PullRequest>> {
    console.log(`Going to get pull requests for repo: ${repoName}`)
    const pulls = (await this.octokit.paginate(
      'GET /repos/:owner/:repo/pulls',
      {
        owner: user,
        repo: repoName,
        state: 'all',
        // eslint-disable-next-line @typescript-eslint/camelcase
        per_page: 100
      },
      response =>
        (response.data as Array<Pull>).map(
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
    )) as Array<PullRequest>
    console.log(`Found ${pulls.length} pull requests`)
    return pulls
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
