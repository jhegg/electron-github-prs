import { ipcMain, shell } from 'electron'
import axios from 'axios'
import {
  IpcResponse,
  GithubResponse,
  Repo,
  GitHubGetReposForUserChannel,
  GitHubSaveTokenChannel,
  GitHubTestAuthenticationChannel,
  GitHubGetPullsForRepoChannel,
  Pull,
  ElectronOpenExternalUrlChannel,
  KeytarGetAccessTokenChannel,
  KeytarSetAccessTokenChannel
} from './ipc-response'
import { Octokit } from '@octokit/rest'
import { PullRequest } from './github'
import { getPassword, setPassword } from 'keytar'
import { keytarServiceName } from './keytar-constants'

class GitHubIpcHandlers {
  private octokit = new Octokit()

  register(): void {
    this.registerSaveAuthenticationHandler()
    this.registerTestAuthenticationHandler()
    this.registerReposHandler()
    this.registerPullRequestsHandler()
  }

  private registerSaveAuthenticationHandler(): void {
    ipcMain.handle(GitHubSaveTokenChannel, async (_event, token) => {
      this.octokit = new Octokit({
        auth: token,
        userAgent: 'jhegg/electron-github-prs 1.0.0'
      })
    })
  }

  private registerTestAuthenticationHandler(): void {
    ipcMain.handle(GitHubTestAuthenticationChannel, async () => {
      try {
        const response = await this.octokit.users.getAuthenticated()
        return new GithubResponse(
          false,
          response.headers,
          response.data,
          response.status
        )
      } catch (error) {
        console.error(`Got error in github test auth handler`)
        console.error(JSON.stringify(error))
        return new GithubResponse(true, error.headers, error.name, error.status)
      }
    })
  }

  private registerReposHandler(): void {
    ipcMain.handle(GitHubGetReposForUserChannel, async (_event, user) => {
      try {
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
        return new GithubResponse(false, null, repoNames.sort(), 200)
      } catch (error) {
        console.error(`Got error in github repos handler`)
        console.error(JSON.stringify(error))
        return new GithubResponse(true, error.headers, error.name, error.status)
      }
    })
  }

  private registerPullRequestsHandler(): void {
    ipcMain.handle(
      GitHubGetPullsForRepoChannel,
      async (_event, user, repoName) => {
        try {
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
                    pull.merge_commit_sha,
                    pull.merged_at,
                    pull.html_url
                  )
              )
          )) as Array<PullRequest>
          return new GithubResponse(false, null, pulls, 200)
        } catch (error) {
          console.error(`Got error in github pull requests handler`)
          console.error(JSON.stringify(error))
          return new GithubResponse(
            true,
            error.headers,
            error.name,
            error.status
          )
        }
      }
    )
  }
}

export class IpcHandlers {
  register(): void {
    this.registerGetAccessTokenFromKeychainHandler()
    this.registerSetAccessTokenFromKeychainHandler()
    this.registerOpenExternalUrlHandler()
    this.registerQueryGithubHandler()
    new GitHubIpcHandlers().register()
  }

  private registerGetAccessTokenFromKeychainHandler(): void {
    ipcMain.handle(KeytarGetAccessTokenChannel, async (_event, accountName) => {
      return await getPassword(keytarServiceName, accountName)
    })
  }

  private registerSetAccessTokenFromKeychainHandler(): void {
    ipcMain.handle(
      KeytarSetAccessTokenChannel,
      async (_event, accountName, token) => {
        await setPassword(keytarServiceName, accountName, token)
      }
    )
  }

  private registerOpenExternalUrlHandler(): void {
    ipcMain.handle(ElectronOpenExternalUrlChannel, async (_event, url) => {
      await shell.openExternal(url)
    })
  }

  private registerQueryGithubHandler(): void {
    ipcMain.handle('query-github', async (_event, user) => {
      try {
        const response = await axios.get(`https://api.github.com/users/${user}`)
        return new IpcResponse(
          false,
          response.headers,
          response.data,
          response.status,
          response.statusText
        )
      } catch (error) {
        return {
          error: true,
          headers: error.response.headers,
          data: error.response.data,
          status: error.response.status,
          statusText: error.response.statusText
        }
      }
    })
  }
}
