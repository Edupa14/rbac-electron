const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,  // Permitir el uso de Node.js en el renderer
            contextIsolation: false // Desactivar el aislamiento de contexto
        }
    });

    // Cargar el archivo HTML principal
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Abrir las herramientas de desarrollador automáticamente
    //mainWindow.webContents.openDevTools();
});

// Finalizar la aplicación cuando todas las ventanas se cierran
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
