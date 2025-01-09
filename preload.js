const { contextBridge } = require('electron');
const db = require('./database');

contextBridge.exposeInMainWorld('api', {
    // ------------------------------ USUARIOS ------------------------------
    getUsers: (callback) => {
        db.all("SELECT * FROM auth_users", [], (err, rows) => {
            callback(err, rows);
        });
    },
    addUser: (username, email, password, callback) => {
        const passwordHash = password; // Aquí puedes aplicar un hash real
        const userId = generateUUID();
        db.run(
            "INSERT INTO auth_users (user_id, username, email, password_hash) VALUES (?, ?, ?, ?)",
            [userId, username, email, passwordHash],
            callback
        );
    },
    updateUser: (userId, username, email, callback) => {
        db.run(
            "UPDATE auth_users SET username = ?, email = ? WHERE user_id = ?",
            [username, email, userId],
            callback
        );
    },
    deleteUser: (userId, callback) => {
        db.run(
            "DELETE FROM auth_users WHERE user_id = ?",
            [userId],
            callback
        );
    },

    // ------------------------------ ROLES ------------------------------
    getRoles: (callback) => {
        db.all("SELECT * FROM auth_roles", [], (err, rows) => {
            callback(err, rows);
        });
    },
    addRole: (roleName, callback) => {
        const roleId = generateUUID();
        db.run(
            "INSERT INTO auth_roles (role_id, role_name) VALUES (?, ?)",
            [roleId, roleName],
            callback
        );
    },
    updateRole: (roleId, roleName, callback) => {
        db.run(
            "UPDATE auth_roles SET role_name = ? WHERE role_id = ?",
            [roleName, roleId],
            callback
        );
    },
    deleteRole: (roleId, callback) => {
        db.run(
            "DELETE FROM auth_roles WHERE role_id = ?",
            [roleId],
            callback
        );
    },

    // ------------------------------ PERMISOS ------------------------------
    getPermissions: (callback) => {
        db.all("SELECT * FROM auth_permissions", [], (err, rows) => {
            callback(err, rows);
        });
    },
    addPermission: (permissionName, description, callback) => {
        const permissionId = generateUUID();
        db.run(
            "INSERT INTO auth_permissions (permission_id, permission_name, description) VALUES (?, ?, ?)",
            [permissionId, permissionName, description],
            callback
        );
    },
    updatePermission: (permissionId, permissionName, description, callback) => {
        db.run(
            "UPDATE auth_permissions SET permission_name = ?, description = ? WHERE permission_id = ?",
            [permissionName, description, permissionId],
            callback
        );
    },
    deletePermission: (permissionId, callback) => {
        db.run(
            "DELETE FROM auth_permissions WHERE permission_id = ?",
            [permissionId],
            callback
        );
    }
});

// ------------------------------ FUNCIONES AUXILIARES ------------------------------
function generateUUID() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
        (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
}
