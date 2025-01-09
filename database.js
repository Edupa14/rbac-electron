const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Definir la ruta de la base de datos
const fs = require('fs');
const dbFolder = path.join(__dirname, 'db');
const dbPath = path.join(dbFolder, 'rbac_system.db');

// Verificar si la carpeta 'db' existe, si no, crearla
if (!fs.existsSync(dbFolder)) {
    fs.mkdirSync(dbFolder);
}

// Crear la conexión a la base de datos SQLite
const database = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
    } else {
        console.log('Conexión exitosa a la base de datos SQLite');
    }
});

// Crear las tablas necesarias para el sistema RBAC
database.serialize(() => {
    database.run(`
        CREATE TABLE IF NOT EXISTS users (
                                             user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             username TEXT NOT NULL,
                                             email TEXT NOT NULL UNIQUE,
                                             password_hash TEXT NOT NULL
        )
    `);

    database.run(`
        CREATE TABLE IF NOT EXISTS roles (
                                             role_id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             role_name TEXT NOT NULL
        )
    `);

    database.run(`
        CREATE TABLE IF NOT EXISTS permissions (
                                                   permission_id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                   permission_name TEXT NOT NULL,
                                                   description TEXT,
                                                   menu_name TEXT,
                                                   menu_code TEXT,
                                                   parent_id INTEGER,
                                                   FOREIGN KEY (parent_id) REFERENCES permissions (permission_id)
            )
    `);

    database.run(`
        CREATE TABLE IF NOT EXISTS role_permissions (
                                                        role_id INTEGER,
                                                        permission_id INTEGER,
                                                        PRIMARY KEY (role_id, permission_id),
            FOREIGN KEY (role_id) REFERENCES roles (role_id),
            FOREIGN KEY (permission_id) REFERENCES permissions (permission_id)
            )
    `);

    database.run(`
        CREATE TABLE IF NOT EXISTS user_roles (
                                                  user_id INTEGER,
                                                  role_id INTEGER,
                                                  PRIMARY KEY (user_id, role_id),
            FOREIGN KEY (user_id) REFERENCES users (user_id),
            FOREIGN KEY (role_id) REFERENCES roles (role_id)
            )
    `);
});

// Exportar la conexión para que pueda ser utilizada en otros módulos
module.exports = database;
