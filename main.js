const { app, BrowserWindow, Menu } = require('electron');

// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent(app)) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}

process.env.NODE_ENV = 'development'; // development or production
const isDev = process.env.NODE_ENV == 'production' ? false : true;
const isMac = process.platform == 'darwin' ? true : false;

let mainWindow;
let aboutWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: isDev? 1920 : 1366,
        height: 768,
        icon: `${__dirname}/assets/img/icons/256x256.png`,
        resizable: isDev ? true : false,
        webPreferences: {
            nodeIntegration: true,
            worldSafeExecuteJavaScript: true,
            contextIsolation: true
        }
    })

    if (isDev) {
        mainWindow.webContents.openDevTools()
    } 

    // mainWindow.loadURL(`file://${__dirname}/app/index.html`);
    mainWindow.loadFile('./screens/index.html');
}

// function createAboutWindow() {
//     aboutWindow = new BrowserWindow({
//         width: 400,
//         height: 400,
//         icon: `${__dirname}/assets/img/icons/icon256x256.png`,
//         parent: mainWindow,
//         modal: true,
//         // show: false,
//         resizable: false,
//         frame: false,
//         transparent: true,
//         webPreferences: {
//             nodeIntegration: true
//         }
//     })

//     aboutWindow.loadFile('./app/about.html');
//     aboutWindow.removeMenu();
// }

app.on('ready', () => {
    createMainWindow()

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);
})

const menu = [
    ...(isMac ? [
        {
            label: 'Tools',
            submenu: [
                { role: 'reload' },
                {
                    label: 'Abex Homepage',
                    click: async () => {
                        const { shell } = require('electron')
                        await shell.openExternal('https://abex.phanthemanh.com')
                    }
                },
                // {
                //     label: 'Über die App',
                //     click: createAboutWindow
                // },
                { role: 'close' }
            ]
        }
    ] : []),
    ...(!isMac ? [
        {
            label: 'Datei',
            submenu: [
                { role: 'reload' },
                { role: 'quit' }
            ]
        },
        {
            label: 'Hilfe',
            submenu: [
                {
                    label: 'Abex Homepage',
                    click: async () => {
                      const { shell } = require('electron')
                      await shell.openExternal('https://abex.phanthemanh.com')
                    }
                },
                // {
                //     label: 'Über die App',
                //     click: createAboutWindow
                // }
            ]
        }
    ] : []),
    ...(isDev ? [{
        label: 'Developer Tools',
        submenu: [
            { role: 'reload' },
            { role: 'toggleDevTools' },
        ]
    }] : [])
]

if (isMac) {
    menu.unshift({'role': 'appMenu'})
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})

function handleSquirrelEvent(application) {
    if (process.argv.length === 1) {
        return false;
    }

    const ChildProcess = require('child_process');
    const path = require('path');

    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawn = function(command, args) {
        let spawnedProcess, error;

        try {
            spawnedProcess = ChildProcess.spawn(command, args, {
                detached: true
            });
        } catch (error) {}

        return spawnedProcess;
    };

    const spawnUpdate = function(args) {
        return spawn(updateDotExe, args);
    };

    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
            // Optionally do things such as:
            // - Add your .exe to the PATH
            // - Write to the registry for things like file associations and
            //   explorer context menus

            // Install desktop and start menu shortcuts
            spawnUpdate(['--createShortcut', exeName]);

            setTimeout(application.quit, 1000);
            return true;

        case '--squirrel-uninstall':
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers

            // Remove desktop and start menu shortcuts
            spawnUpdate(['--removeShortcut', exeName]);

            setTimeout(application.quit, 1000);
            return true;

        case '--squirrel-obsolete':
            // This is called on the outgoing version of your app before
            // we update to the new version - it's the opposite of
            // --squirrel-updated

            application.quit();
            return true;
    }
};