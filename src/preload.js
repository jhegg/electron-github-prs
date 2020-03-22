/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-undef */
import { contextBridge, ipcRenderer } from 'electron'
import { getPassword, setPassword, deletePassword } from 'keytar'
import { keytarServiceName, keytarAccountName } from './keytar-constants'

contextBridge.exposeInMainWorld('electron', {
  deleteAccessTokenFromKeychain: () =>
    deletePassword(keytarServiceName, keytarAccountName),
  getAccessTokenFromKeychain: () =>
    getPassword(keytarServiceName, keytarAccountName),
  setAccessTokenInKeychain: token =>
    setPassword(keytarServiceName, keytarAccountName, token),
  ipcRendererInvoke: (channel, ...args) => {
    return ipcRenderer.invoke(channel, ...args)
  }
})
