// Модуль для управления жизненным циклом приложения и собственным окном браузера.
const { app, BrowserWindow, protocol } = require("electron");
const path = require("path");
const url = require("url");

// Создание окна браузера
function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        // путь к дополнительному сценарию "предварительной загрузки", который можно использовать для
        // обмена данными между node-land и browser-land.
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });


    const appURL = app.isPackaged
        ? url.format({
            pathname: path.join(__dirname, "index.html"),
            protocol: "file:",
            slashes: true,
        })
        : "http://localhost:3000";
    mainWindow.loadURL(appURL);

    // Автоматически открывает инструменты разработки Chrome в режиме разработки.
    if (!app.isPackaged) {
        mainWindow.webContents.openDevTools();
    }
}

// Настройка локального прокси-сервера для настройки путей к запрашиваемым файлам при загрузке
// их из локального производственного пакета (например: локальные шрифты и т.д. ...).
function setupLocalFilesNormalizerProxy() {
    protocol.registerHttpProtocol(
        "file",
        (request, callback) => {
            const url = request.url.substr(8);
            callback({ path: path.normalize(`${__dirname}/${url}`) });
        },
        (error) => {
            if (error) console.error("Failed to register protocol");
        },
    );
}

// Этот метод будет вызван, когда Electron завершит свою инициализацию и
// будет готов к созданию окон браузера.
app.whenReady().then(() => {
    createWindow();
    setupLocalFilesNormalizerProxy();

    app.on("activate", function () {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// приложение слушает событие окна-все-закрыты. Когда это событие происходит - происходит выход из приложения
app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

//запрет любого вида навигации, так как приложение имеет только одно окно
const allowedNavigationDestinations = "https://my-electron-app.com";
app.on("web-contents-created", (event, contents) => {
    contents.on("will-navigate", (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);

        if (!allowedNavigationDestinations.includes(parsedUrl.origin)) {
            event.preventDefault();
        }
    });
});

// const path = require('path');
//
// const { app, BrowserWindow } = require('electron');
// const isDev = require('electron-is-dev');
//
// function createWindow() { // создание окна приложения
//     const win = new BrowserWindow({ // инициализация окна браузера
//         width: 800, //ширина окна
//         height: 800, // высота окна
//         webPreferences: {
//             nodeIntegration: true,
//         },
//     });
//
//     // загрузка корневого файла index.html приложения
//     win.loadURL(
//         isDev
//             ? 'http://localhost:3000'
//             : `file://${path.join(__dirname, '../build/index.html')}`
//     );
//     // открытие окна devTools
//     if (isDev) {
//         win.webContents.openDevTools({ mode: 'detach' });
//     }
// }
//
// // создание главного окна, когда электрон готов к работе
// app.whenReady().then(createWindow);
//
//
// // приложение слушает событие окна-все-закрыты. Когда это событие происходит - происходит выход из приложения
// app.on('window-all-closed', () => {
//     if (process.platform !== 'darwin') {
//         app.quit();
//     }
// });
//
// // слушает событие 'activate', которое происходит, когда пользователь пытается активировать приложение .
// // Функция обратного вызова проверяет, есть ли у приложения открытые окна (строка 45)
// // Если окон нет, то вызывается createWindow(),
// // что означает создание нового окна приложения для восстановления его работы.
// app.on('activate', () => {
//     if (BrowserWindow.getAllWindows().length === 0) {
//         createWindow();
//     }
// });
