import { contextBridge, shell } from 'electron'
import { getPassword, setPassword, deletePassword } from 'keytar'
import { keytarServiceName, keytarAccountName } from './keytar-constants'

contextBridge.exposeInMainWorld('electron', {
  openExternal: url => shell.openExternal(url),
  deleteAccessTokenFromKeychain: () =>
    deletePassword(keytarServiceName, keytarAccountName),
  getAccessTokenFromKeychain: () =>
    getPassword(keytarServiceName, keytarAccountName),
  setAccessTokenInKeychain: token =>
    setPassword(keytarServiceName, keytarAccountName, token)
})
