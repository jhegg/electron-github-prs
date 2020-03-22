/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-undef */
import { contextBridge, ipcRenderer } from 'electron'
import { setPassword } from 'keytar'
import { keytarServiceName, keytarAccountName } from './keytar-constants'

contextBridge.exposeInMainWorld('electron', {
  setAccessTokenInKeychain: token =>
    setPassword(keytarServiceName, keytarAccountName, token),
  ipcRendererInvoke: (channel, ...args) => {
    return ipcRenderer.invoke(channel, ...args)
  }
})
