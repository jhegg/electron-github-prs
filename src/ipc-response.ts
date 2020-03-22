import { ResponseHeaders } from '@octokit/types'

export const KeytarGetAccessTokenChannel = 'get-access-token'
export const KeytarSetAccessTokenChannel = 'set-access-token'
export const GitHubGetPullsForRepoChannel = 'github-get-pulls-for-repo'
export const GitHubGetReposForUserChannel = 'github-get-repos-for-user'
export const GitHubSaveTokenChannel = 'save-github-token'
export const GitHubTestAuthenticationChannel = 'test-github-auth'
export const ElectronOpenExternalUrlChannel = 'open-external-url'

export class IpcResponse {
  error: boolean
  headers: object
  data: object
  status: number
  statusText?: string

  constructor(
    error: boolean,
    headers: any,
    data: any,
    status: number,
    statusText?: string
  ) {
    this.error = error
    this.headers = headers
    this.data = data
    this.status = status
    this.statusText = statusText
  }
}

export class GithubResponse {
  error: boolean
  headers: ResponseHeaders
  data: any
  status: number

  constructor(
    error: boolean,
    headers: ResponseHeaders,
    data: any,
    status: number
  ) {
    this.error = error
    this.headers = headers
    this.status = status
    this.data = data
  }
}

export interface Repo {
  name: string
}

export interface Pull {
  number: number
  user: {
    login: string
  }
  title: string
  created_at: string
  merge_commit_sha: string
  merged_at: string
  html_url: string
}
