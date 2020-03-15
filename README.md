# electron-github-prs

A simple Electron example app leveraging TypeScript and Webpack (courtesy of [Electron Forge](https://www.electronforge.io/templates/typescript-+-webpack-template)).

Makes authenticated GitHub API queries to get the repository list for `jhegg`, and then when a specific repo is selected the pull requests are summarized.

## Prerequisites

### Linux

This app uses [`keytar`](https://atom.github.io/node-keytar/) to store the GitHub access token in the OS keychain. On Linux, you may need to install `libsecret` per the `keytar` documentation.

## How to use

- `npm install`
- `npm start`
- Add a valid GitHub personal access token, click Save
- Use the dropdown to select a repo, such as `electron-github-prs`
- Click the button to fetch PR data
