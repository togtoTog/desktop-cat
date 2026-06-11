const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let win = null;

/** 读取配置（失败则回退到内置默认值） */
function loadConfig() {
  const configPath = path.join(__dirname, '..', '..', 'config', 'cat.config.json');
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (e) {
    console.warn('[desktop-cat] 读取配置失败，使用默认配置：', e.message);
    return {
      appearance: { size: 120, imagePath: 'src/assets/cat-idle.png', useImageIfPresent: true },
      behavior: {},
      window: { alwaysOnTop: true, clickThrough: true }
    };
  }
}

function createWindow() {
  const config = loadConfig();
  const primary = screen.getPrimaryDisplay();
  const { width, height } = primary.workAreaSize;

  win = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    resizable: false,
    movable: false,
    skipTaskbar: true,
    hasShadow: false,
    alwaysOnTop: config.window?.alwaysOnTop !== false,
    focusable: false,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // 置顶到所有层级之上（包括全屏应用之上）
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  // 默认整窗点击穿透；猫身上时由渲染进程通知主进程临时关闭穿透
  if (config.window?.clickThrough !== false) {
    win.setIgnoreMouseEvents(true, { forward: true });
  }

  win.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  if (process.argv.includes('--dev')) {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  // 渲染进程根据鼠标是否悬停在猫身上，切换是否穿透
  ipcMain.on('set-ignore-mouse', (_evt, ignore) => {
    if (!win) return;
    win.setIgnoreMouseEvents(ignore, { forward: true });
  });

  // 提供窗口工作区尺寸给渲染进程
  ipcMain.handle('get-work-area', () => {
    const d = screen.getPrimaryDisplay();
    return d.workAreaSize;
  });

  // 提供配置给渲染进程
  ipcMain.handle('get-config', () => loadConfig());

  // 提供全局鼠标位置（用于跟随鼠标，即使在穿透状态下也能拿到）
  ipcMain.handle('get-cursor-pos', () => screen.getCursorScreenPoint());

  win.on('closed', () => { win = null; });
}

app.whenReady().then(() => {
  // macOS：隐藏 Dock 图标，让它更像一个桌面小挂件
  if (process.platform === 'darwin' && app.dock) {
    app.dock.hide();
  }
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
