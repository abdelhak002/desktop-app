import { app, ipcMain, dialog } from 'electron'
import {
  type ProgressInfo,
  type UpdateDownloadedEvent,
  autoUpdater,
  UpdateInfo
} from 'electron-updater'
import log from 'electron-log';

  
// auto update functions section
export async function autoUpdate() {
  await autoUpdater.checkForUpdates();
  startHandlingUpdateProgress();
}

function startHandlingUpdateProgress() {
  autoUpdater.on('error', (e) => {
    log.error('@error@\n', e);
    dialog.showErrorBox(
      'Error: ',
      e == null ? 'unknown' : (e.stack || e).toString()
    );
  });
  autoUpdater.on('update-downloaded', async (info: UpdateInfo) => {
    log.info('@update-downloaded@\n', info);
    await handleUpdateDownloaded();
    // Remove all event listeners
    autoUpdater.removeAllListeners();
  });
}

async function handleUpdateDownloaded() {
  if ((await askRestartAndInstall()) === InstallDialogResult.NotNow) {
    return;
  }
  setTimeout(() => autoUpdater.quitAndInstall(true, true), 1);
}

enum InstallDialogResult {
  InstallAndRestart = 0,
  NotNow = 1,
}
async function askRestartAndInstall(): Promise<InstallDialogResult> {
  const installDialogResult = await dialog.showMessageBox({
    type: 'question',
    buttons: ['Install and restart', 'Later'],
    message: `A new version of ${app.name} has been downloaded.`,
    detail: 'It will be installed the next time you restart the application.',
    defaultId: InstallDialogResult.InstallAndRestart,
    cancelId: InstallDialogResult.NotNow,
  });
  return installDialogResult.response;
  }


export function update(win: Electron.BrowserWindow) {

  // When set to false, the update download will be triggered through the API
  autoUpdater.autoDownload = true
  autoUpdater.disableWebInstaller = false
  autoUpdater.allowDowngrade = false

  // start check
  autoUpdater.on('checking-for-update', async function () {
    if (!app.isPackaged) {
      const error = new Error('The update feature is only available after the package.')
      return { message: error.message, error }
    }

    try {
      console.log('check-update')
      return await autoUpdater.checkForUpdatesAndNotify()
    } catch (error) {
      return { message: 'Network error', error }
    } })
  // update available
  autoUpdater.on('update-available', (arg) => {
    console.log('update-available', arg)
    win.webContents.send('update-can-available', { update: true, version: app.getVersion(), newVersion: arg?.version })
  })
  // update not available
  autoUpdater.on('update-not-available', (arg) => {
    win.webContents.send('update-can-available', { update: false, version: app.getVersion(), newVersion: arg?.version })
  })

  // Checking for updates
  ipcMain.handle('check-update', async () => {
    if (!app.isPackaged) {
      const error = new Error('The update feature is only available after the package.')
      return { message: error.message, error }
    }

    try {
      console.log('check-update')
      return await autoUpdater.checkForUpdatesAndNotify()
    } catch (error) {
      return { message: 'Network error', error }
    }
  })

  // Start downloading and feedback on progress
  ipcMain.handle('start-download', (event) => {
    startDownload(
      (error, progressInfo) => {
        if (error) {
          // feedback download error message
          event.sender.send('update-error', { message: error.message, error })
        } else {
          // feedback update progress message
          console.log('start-download', progressInfo)
          event.sender.send('download-progress', progressInfo)
        }
      },
      () => {
        // feedback update downloaded message
        event.sender.send('update-downloaded')
      }
    )
  })

  // Install now
  ipcMain.handle('quit-and-install', () => {
    console.log('quit-and-install')
    autoUpdater.quitAndInstall()
  })
}

function startDownload(
  callback: (error: Error | null, info: ProgressInfo | null) => void,
  complete: (event: UpdateDownloadedEvent) => void,
) {
  console.log('start-downloading')
  autoUpdater.on('download-progress', info => callback(null, info))
  autoUpdater.on('error', error => callback(error, null))
  autoUpdater.on('update-downloaded', complete)
  autoUpdater.downloadUpdate()
}
