const db = require('./database'); // Importar la conexión a la base de datos

document.addEventListener('DOMContentLoaded', () => {

    const contentArea = document.getElementById('content-area');
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            // Remover la clase 'active' de todos los enlaces
            navLinks.forEach((nav) => nav.classList.remove('active'));

            // Añadir la clase 'active' al enlace clicado
            e.target.classList.add('active');
        });
    });

    // Manejo de navegación
    document.getElementById('nav-users').addEventListener('click', loadUsers);
    document.getElementById('nav-roles').addEventListener('click', loadRoles);
    document.getElementById('nav-permissions').addEventListener('click', loadPermissions);
//------------------LOGIN---------------------------

    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginError = document.getElementById('login-error');

    // Verificar si el usuario ya está autenticado
    if (sessionStorage.getItem('authenticatedUser')) {
        showDashboard();
    } else {
        showLogin();
    }

    // Evento de envío del formulario de login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordHash = btoa(password); // Hash simple para ejemplo

        db.get(
            `SELECT * FROM users WHERE email = ? AND password_hash = ?`,
            [email, passwordHash],
            (err, row) => {
                if (err) {
                    console.error('Error al buscar usuario:', err.message);
                    loginError.textContent = 'Error en el sistema. Intente nuevamente.';
                    loginError.style.display = 'block';
                    return;
                }

                if (row) {
                    // Guardar la sesión del usuario
                    sessionStorage.setItem('authenticatedUser', email);
                    showDashboard();
                } else {
                    // Mostrar mensaje de error si las credenciales son incorrectas
                    loginError.textContent = 'Correo o contraseña incorrectos.';
                    loginError.style.display = 'block';
                }
            }
        );
    });

    // Evento de cierre de sesión
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('authenticatedUser');
        showLogin();
    });

    // Función para mostrar el login
    function showLogin() {
        loginSection.classList.remove('d-none');
        dashboardSection.classList.add('d-none');
    }

    // Función para mostrar el dashboard
    function showDashboard() {
        loginSection.classList.add('d-none');
        dashboardSection.classList.remove('d-none');
        loadDashboard();
    }

    // Función para cargar el contenido del dashboard
    function loadDashboard() {
        console.log('Cargando el dashboard...');
        // Aquí puedes llamar a loadUsers(), loadRoles(), loadPermissions(), etc.
        loadUsers();
    }


//------------------USERS---------------------------

    let currentEditId = null; // ID del usuario actual en edición

    // Función para cargar la vista de usuarios
    function loadUsers() {
        contentArea.innerHTML = `
            <h2>Gestión de Usuarios</h2>
            <button class="btn btn-primary" id="add-user">Añadir Usuario</button>
            <table class="table mt-3">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Roles</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="user-list"></tbody>
            </table>

            <!-- Modal de formulario para agregar/editar usuario -->
            <div class="modal fade" id="userModal" tabindex="-1" aria-labelledby="userModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="userModalLabel">Añadir Usuario</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="userForm">
                                <div class="mb-3">
                                    <label for="username" class="form-label">Username</label>
                                    <input type="text" class="form-control" id="username" required>
                                </div>
                                <div class="mb-3">
                                    <label for="email" class="form-label">Email</label>
                                    <input type="email" class="form-control" id="email" required>
                                        <div id="emailError" class="text-danger mt-1" style="display: none;"></div>

                                </div>
                                <div class="mb-3">
                                    <label for="roles" class="form-label">Roles</label>
                                    <select multiple class="form-select" id="roles"></select>
                                </div>
                                <div id="passwordSection">
                                    <div class="mb-3">
                                        <label for="password" class="form-label">Contraseña</label>
                                        <input type="password" class="form-control" id="password" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="confirmPassword" class="form-label">Confirmar Contraseña</label>
                                        <input type="password" class="form-control" id="confirmPassword" required>
                                    </div>
                                </div>
                                <button type="submit" class="btn btn-primary">Guardar</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal de confirmación para eliminar usuario -->
            <div class="modal fade" id="confirmDeleteModal" tabindex="-1" aria-labelledby="confirmDeleteLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="confirmDeleteLabel">Confirmar Eliminación</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p id="deleteMessage">¿Está seguro de que desea eliminar este usuario?</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal de actualización de contraseña -->
            <div class="modal fade" id="passwordModal" tabindex="-1" aria-labelledby="passwordModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="passwordModalLabel">Actualizar Contraseña</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="passwordForm">
                                <div class="mb-3">
                                    <label for="newPassword" class="form-label">Nueva Contraseña</label>
                                    <input type="password" class="form-control" id="newPassword" required>
                                </div>
                                <div class="mb-3">
                                    <label for="confirmNewPassword" class="form-label">Confirmar Nueva Contraseña</label>
                                    <input type="password" class="form-control" id="confirmNewPassword" required>
                                </div>
                                <button type="submit" class="btn btn-primary">Actualizar</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('userForm').addEventListener('submit', (e) => {
            e.preventDefault(); // Prevenir el comportamiento por defecto del formulario

            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const selectedRoles = Array.from(document.getElementById('roles').selectedOptions).map(option => option.value);
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (!currentEditId && password !== confirmPassword) {
                alert('Las contraseñas no coinciden');
                return;
            }

            if (currentEditId) {
                updateUser(currentEditId, username, email, selectedRoles);
            } else {
                addUser(username, email, password, selectedRoles);
            }
        });

        document.getElementById('add-user').addEventListener('click', () => {
            currentEditId = null;
            document.getElementById('userForm').reset();
            document.getElementById('userModalLabel').textContent = 'Añadir Usuario';
            document.getElementById('passwordSection').style.display = 'block';
            loadRolesForUsers();
            new bootstrap.Modal(document.getElementById('userModal')).show();
        });

        fetchUsers();
    }

    window.addUser = function (username, email, password, roles) {
        const passwordHash = btoa(password); // Hash simple para ejemplo (usar bcrypt en producción)
        const modal = bootstrap.Modal.getInstance(document.getElementById('userModal'));

        db.run(
            `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`,
            [username, email, passwordHash],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed: users.email')) {
                        const emailError = document.getElementById('emailError');
                        emailError.textContent = 'El correo ya está registrado. Por favor, use otro.';
                        emailError.style.display = 'block';
                    } else {
                        console.error('Error al añadir usuario:', err.message);
                        alert('Ocurrió un error al añadir el usuario.');
                    }
                    return;
                }
                const userId = this.lastID;
                insertUserRoles(userId, roles);
                alert('Usuario añadido con éxito');
                fetchUsers();
                modal.hide();
            }
        );
    };


    function insertUserRoles(userId, roles) {
        roles.forEach(roleId => {
            db.run(
                `INSERT INTO user_roles (user_id, role_id)
                 VALUES (?, ?) `,
                [userId, roleId],
                function (err) {
                    if (err) {
                        console.error('Error al añadir roles al usuario:', err.message);
                    }
                }
            );
        });
    }

    function updateUser(id, username, email, roles) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('userModal'));

        db.run(
            `UPDATE users
             SET username = ?,
                 email    = ?
             WHERE user_id = ?`,
            [username, email, id],
            function (err) {
                if (err) {
                    return console.error('Error al actualizar usuario:', err.message);
                }
                db.run(
                    `DELETE
                     FROM user_roles
                     WHERE user_id = ?`,
                    [id],
                    function (err) {
                        if (err) {
                            return console.error('Error al eliminar roles antiguos del usuario:', err.message);
                        }
                        insertUserRoles(id, roles);
                        alert('Usuario actualizado con éxito');
                        fetchUsers();
                        modal.hide();
                    }
                );
            }
        );
    }

    function loadRolesForUsers(selectedRoles = []) {
        db.all(`SELECT *
                FROM roles`, [], (err, rows) => {
            if (err) {
                return console.error('Error al obtener roles:', err.message);
            }
            const rolesSelect = document.getElementById('roles');
            rolesSelect.innerHTML = '';
            rows.forEach((role) => {
                const option = document.createElement('option');
                option.value = role.role_id;
                option.textContent = role.role_name;
                if (selectedRoles.includes(role.role_id)) {
                    option.selected = true;
                }
                rolesSelect.appendChild(option);
            });
        });
    }

    function fetchUsers() {
        db.all(`SELECT u.user_id, u.username, u.email, GROUP_CONCAT(r.role_name) AS roles
                FROM users u
                         LEFT JOIN user_roles ur ON u.user_id = ur.user_id
                         LEFT JOIN roles r ON ur.role_id = r.role_id
                GROUP BY u.user_id`, [], (err, rows) => {
            if (err) {
                return console.error('Error al obtener usuarios:', err.message);
            }
            const userList = document.getElementById('user-list');
            userList.innerHTML = '';
            rows.forEach((user) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.user_id}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.roles || 'Sin roles'}</td>
                    <td>
                        <button class="btn btn-sm btn-warning edit-user" data-id="${user.user_id}" data-username="${user.username}" data-email="${user.email}">Editar</button>
                        <button class="btn btn-sm btn-info update-password" data-id="${user.user_id}">Actualizar Contraseña</button>
                        <button class="btn btn-sm btn-danger delete-user" data-id="${user.user_id}">Eliminar</button>
                    </td>
                `;
                userList.appendChild(row);
            });

            document.querySelectorAll('.edit-user').forEach((button) => {
                button.addEventListener('click', () => {
                    const id = button.getAttribute('data-id');
                    const username = button.getAttribute('data-username');
                    const email = button.getAttribute('data-email');
                    editUser(id, username, email);
                });
            });

            document.querySelectorAll('.update-password').forEach((button) => {
                button.addEventListener('click', () => {
                    const id = button.getAttribute('data-id');
                    openPasswordModal(id);
                });
            });

            document.querySelectorAll('.delete-user').forEach((button) => {
                button.addEventListener('click', () => {
                    const id = button.getAttribute('data-id');
                    confirmDeleteUser(id);
                });
            });
        });
    }

    function editUser(id, username, email) {
        currentEditId = id;
        document.getElementById('username').value = username;
        document.getElementById('email').value = email;
        document.getElementById('passwordSection').style.display = 'none';
        loadUserRoles(id);
        document.getElementById('userModalLabel').textContent = 'Editar Usuario';
        new bootstrap.Modal(document.getElementById('userModal')).show();
    }

    function loadUserRoles(userId) {
        db.all(`SELECT role_id
                FROM user_roles
                WHERE user_id = ?`, [userId], (err, rows) => {
            if (err) {
                return console.error('Error al obtener roles del usuario:', err.message);
            }
            const assignedRoles = rows.map(row => row.role_id);
            loadRolesForUsers(assignedRoles);
        });
    }

    function openPasswordModal(userId) {
        currentEditId = userId;
        new bootstrap.Modal(document.getElementById('passwordModal')).show();
        document.getElementById('passwordForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;

            if (newPassword !== confirmNewPassword) {
                alert('Las contraseñas no coinciden');
                return;
            }

            updatePassword(currentEditId, newPassword);
        });
    }

    function updatePassword(userId, newPassword) {
        const passwordHash = btoa(newPassword);
        const modal = bootstrap.Modal.getInstance(document.getElementById('passwordModal'));

        db.run(`UPDATE users
                SET password_hash = ?
                WHERE user_id = ?`, [passwordHash, userId], function (err) {
            if (err) {
                return console.error('Error al actualizar la contraseña:', err.message);
            }
            alert('Contraseña actualizada con éxito');
            modal.hide();
        });
    }

    function confirmDeleteUser(id) {
        currentEditId = id;
        const modal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
        modal.show();
        document.getElementById('confirmDeleteBtn').onclick = () => deleteUser(id, modal);
    }

    function deleteUser(id, modal) {
        db.run(`DELETE
                FROM users
                WHERE user_id = ?`, [id], function (err) {
            if (err) {
                if (err.message.includes('FOREIGN KEY constraint failed')) {
                    alert('No se puede eliminar el usuario porque tiene dependencias.');
                } else {
                    console.error('Error al eliminar usuario:', err.message);
                }
                return;
            }
            alert('Usuario eliminado con éxito');
            fetchUsers();
            modal.hide();
        });
    }


    //------------------------ROLES----------------------------------------------


    navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            navLinks.forEach((nav) => nav.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    document.getElementById('nav-roles').addEventListener('click', loadRoles);

    function loadRoles() {
        contentArea.innerHTML = `
            <h2>Gestión de Roles</h2>
            <button class="btn btn-primary" id="add-role">Añadir Rol</button>
            <table class="table mt-3">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre del Rol</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="role-list"></tbody>
            </table>

            <!-- Modal de formulario para agregar/editar rol -->
            <div class="modal fade" id="roleModal" tabindex="-1" aria-labelledby="roleModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="roleModalLabel">Añadir Rol</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="roleForm">
                                <div class="mb-3">
                                    <label for="roleName" class="form-label">Nombre del Rol</label>
                                    <input type="text" class="form-control" id="roleName" required>
                                </div>
                                <div class="mb-3">
                                    <label for="permissions" class="form-label">Permisos</label>
                                    <div id="permissionTree" class="ms-3"></div>
                                </div>
                                <button type="submit" class="btn btn-primary">Guardar</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>        
            <!-- Modal de confirmación para eliminar rol -->
            <div class="modal fade" id="confirmDeleteRoleModal" tabindex="-1" aria-labelledby="confirmDeleteRoleLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="confirmDeleteRoleLabel">Confirmar Eliminación</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p id="deleteRoleMessage">¿Está seguro de que desea eliminar este rol?</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-danger" id="confirmDeleteRoleBtn">Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>
    `;
        document.getElementById('add-role').addEventListener('click', () => {
            currentEditId = null;
            document.getElementById('roleForm').reset();
            document.getElementById('roleModalLabel').textContent = 'Añadir Rol';
            loadPermissionsForRoles();
            new bootstrap.Modal(document.getElementById('roleModal')).show();
        });

        document.getElementById('roleForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const roleName = document.getElementById('roleName').value;
            const selectedPermissions = getSelectedPermissions();

            if (currentEditId) {
                updateRole(currentEditId, roleName, selectedPermissions);
            } else {
                addRole(roleName, selectedPermissions);
            }
        });

        fetchRoles();
    }

    function loadPermissionsForRoles(callback) {
        db.all(`SELECT *
                FROM permissions`, [], (err, rows) => {
            if (err) {
                return console.error('Error al obtener permisos:', err.message);
            }
            const treeContainer = document.getElementById('permissionTree');
            treeContainer.innerHTML = buildPermissionTree(rows);

            if (callback) {
                callback(); // Llamar al callback después de construir el árbol
            }
        });
    }


    function buildPermissionTree(permissions) {
        const tree = {};

        // Organizar permisos por parent_id
        permissions.forEach(permission => {
            if (!permission.parent_id) {
                tree[permission.permission_id] = {...permission, children: []};
            } else {
                if (!tree[permission.parent_id]) {
                    tree[permission.parent_id] = {children: []};
                }
                tree[permission.parent_id].children.push(permission);
            }
        });

        // Generar HTML recursivamente
        function generateTreeHTML(node) {
            let html = `<div>
        <input type="checkbox" class="permission-checkbox" value="${String(node.permission_id)}" id="perm-${node.permission_id}">
        <label for="perm-${node.permission_id}">${node.permission_name}</label>
    `;

            if (node.children && node.children.length > 0) {
                html += '<div class="ms-4">';
                node.children.forEach(child => {
                    html += generateTreeHTML(child);
                });
                html += '</div>';
            }

            html += '</div>';
            return html;
        }


        let treeHTML = '';
        Object.values(tree).forEach(rootNode => {
            treeHTML += generateTreeHTML(rootNode);
        });

        return treeHTML;
    }

    function getSelectedPermissions() {
        const checkboxes = document.querySelectorAll('.permission-checkbox:checked');
        return Array.from(checkboxes).map(checkbox => checkbox.value);
    }

    function addRole(roleName, permissions) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('roleModal'));

        db.run(
            `INSERT INTO roles (role_name)
             VALUES (?)`,
            [roleName],
            function (err) {
                if (err) {
                    return console.error('Error al añadir rol:', err.message);
                }
                const roleId = this.lastID;
                insertRolePermissions(roleId, permissions);
                alert('Rol añadido con éxito');
                fetchRoles();
                modal.hide();
            }
        );
    }

    function insertRolePermissions(roleId, permissions) {
        permissions.forEach(permissionId => {
            db.run(
                `INSERT INTO role_permissions (role_id, permission_id)
                 VALUES (?, ?)`,
                [roleId, permissionId],
                function (err) {
                    if (err) {
                        console.error('Error al añadir permisos al rol:', err.message);
                    }
                }
            );
        });
    }

    function updateRole(roleId, roleName, permissions) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('roleModal'));

        db.run(
            `UPDATE roles
             SET role_name = ?
             WHERE role_id = ?`,
            [roleName, roleId],
            function (err) {
                if (err) {
                    return console.error('Error al actualizar rol:', err.message);
                }
                db.run(
                    `DELETE
                     FROM role_permissions
                     WHERE role_id = ?`,
                    [roleId],
                    function (err) {
                        if (err) {
                            return console.error('Error al eliminar permisos antiguos del rol:', err.message);
                        }
                        insertRolePermissions(roleId, permissions);
                        alert('Rol actualizado con éxito');
                        fetchRoles();
                        modal.hide();
                    }
                );
            }
        );
    }

    function fetchRoles() {
        db.all(`SELECT *
                FROM roles`, [], (err, rows) => {
            if (err) {
                return console.error('Error al obtener roles:', err.message);
            }
            const roleList = document.getElementById('role-list');
            roleList.innerHTML = '';
            rows.forEach((role) => {
                roleList.innerHTML += `
                    <tr>
                        <td>${role.role_id}</td>
                        <td>${role.role_name}</td>
                        <td>
                            <button class="btn btn-sm btn-warning edit-role" data-id="${role.role_id}" data-name="${role.role_name}">Editar</button>
                            <button class="btn btn-sm btn-danger delete-role" data-id="${role.role_id}">Eliminar</button>
                        </td>
                    </tr>
                `;
            });

            document.querySelectorAll('.edit-role').forEach((button) => {
                button.addEventListener('click', () => {
                    const id = button.getAttribute('data-id');
                    const name = button.getAttribute('data-name');
                    editRole(id, name);
                });
            });

            document.querySelectorAll('.delete-role').forEach((button) => {
                button.addEventListener('click', () => {
                    const id = button.getAttribute('data-id');
                    confirmDeleteRole(id);
                });
            });
        });
    }

    function editRole(id, roleName) {
        currentEditId = id;
        document.getElementById('roleName').value = roleName;

        loadPermissionsForRoles(() => {
            loadRolePermissions(id); // Marcar permisos después de cargar el árbol
        });

        document.getElementById('roleModalLabel').textContent = 'Editar Rol';
        new bootstrap.Modal(document.getElementById('roleModal')).show();
    }


    function loadRolePermissions(roleId) {
        db.all(
            `SELECT permission_id
             FROM role_permissions
             WHERE role_id = ?`,
            [roleId],
            (err, rows) => {
                if (err) {
                    return console.error('Error al obtener permisos del rol:', err.message);
                }
                const assignedPermissions = rows.map(row => String(row.permission_id)); // Convertir a string

                document.querySelectorAll('.permission-checkbox').forEach((checkbox) => {
                    if (assignedPermissions.includes(checkbox.value)) {
                        checkbox.checked = true;
                    }
                });
            }
        );
    }

    function confirmDeleteRole(id) {
        currentEditId = id;
        document.getElementById('deleteRoleMessage').textContent = '¿Está seguro de que desea eliminar este rol?';
        const modal = new bootstrap.Modal(document.getElementById('confirmDeleteRoleModal'));
        modal.show();

        document.getElementById('confirmDeleteRoleBtn').onclick = () => {
            deleteRole(currentEditId, modal);
        };
    }

    function deleteRole(id, modal) {
        // Eliminar las relaciones del rol en la tabla role_permissions
        db.run(`DELETE
                FROM role_permissions
                WHERE role_id = ?`, [id], function (err) {
            if (err) {
                return console.error('Error al eliminar permisos del rol:', err.message);
            }

            // Eliminar el rol de la tabla roles
            db.run(`DELETE
                    FROM roles
                    WHERE role_id = ?`, [id], function (err) {
                if (err) {
                    if (err.message.includes('FOREIGN KEY constraint failed')) {
                        alert('No se puede eliminar el rol porque tiene dependencias.');
                    } else {
                        console.error('Error al eliminar rol:', err.message);
                    }
                    return;
                }

                alert('Rol eliminado con éxito');
                fetchRoles();
                modal.hide(); // Cerrar el modal de confirmación
            });
        });
    }


    //--------------------PERMISISSIONS----------------------------

    function loadPermissions() {
        contentArea.innerHTML = `
      <h2>Gestión de Permisos</h2>
      <button class="btn btn-primary" id="add-permission">Añadir Permiso</button>
      <table class="table mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre del Permiso</th>
            <th>Descripción</th>
            <th>Código del Menú</th>
            <th>Menú Padre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="permission-list"></tbody>
      </table>

      <!-- Modal de formulario para agregar/editar permiso -->
      <div class="modal fade" id="permissionModal" tabindex="-1" aria-labelledby="permissionModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="permissionModalLabel">Añadir Permiso</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="permissionForm">
                  <div class="mb-3">
                    <label for="permissionName" class="form-label">Nombre del Permiso</label>
                    <input type="text" class="form-control" id="permissionName" required>
                  </div>
                  <div class="mb-3">
                    <label for="description" class="form-label">Descripción</label>
                    <input type="text" class="form-control" id="description">
                  </div>
                  <div class="mb-3">
                    <label for="menuName" class="form-label">Menú</label>
                    <input type="text" class="form-control" id="menuName" required>
                  </div>
                  <div class="mb-3">
                    <label for="parentId" class="form-label">Permiso Padre</label>
                    <select class="form-control" id="parentId">
                      <option value="">Ninguno</option>
                    </select>
                  </div>
                  <button type="submit" class="btn btn-primary">Guardar</button>
                </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de confirmación para eliminar permiso -->
      <div class="modal fade" id="confirmDeletePermissionModal" tabindex="-1" aria-labelledby="confirmDeletePermissionLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="confirmDeletePermissionLabel">Confirmar Eliminación</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p id="deletePermissionMessage">¿Está seguro de que desea eliminar este permiso?</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal
">Cancelar</button>
              <button type="button" class="btn btn-danger" id="confirmDeletePermissionBtn">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    `;

        document.getElementById('add-permission').addEventListener('click', () => {
            currentEditId = null;
            document.getElementById('permissionForm').reset();
            document.getElementById('permissionModalLabel').textContent = 'Añadir Permiso';

            // Llenar las opciones de permisos padres
            populateParentOptions();

            new bootstrap.Modal(document.getElementById('permissionModal')).show();
        });

        document.getElementById('permissionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const permissionName = document.getElementById('permissionName').value;
            const description = document.getElementById('description').value;
            const menuName = document.getElementById('menuName').value;
            const parentId = document.getElementById('parentId').value || null;

            if (currentEditId) {
                updatePermission(currentEditId, permissionName, description, menuName, parentId);
            } else {
                addPermission(permissionName, description, menuName, parentId);
            }
        });

        fetchPermissions();
    }

    function populateParentOptions(currentId = null) {
        const parentIdSelect = document.getElementById('parentId');
        parentIdSelect.innerHTML = '<option value="">Ninguno</option>';

        db.all(`SELECT permission_id, permission_name
                FROM permissions`, [], (err, rows) => {
            if (err) {
                return console.error('Error al obtener permisos para opciones de parent:', err.message);
            }
            rows.forEach((permission) => {
                // Excluir el permiso actual de las opciones de parent_id
                if (permission.permission_id != currentId) {
                    console.log(permission.permission_id, currentId)
                    parentIdSelect.innerHTML += `<option value="${permission.permission_id}">${permission.permission_name}</option>`;
                }
            });
        });
    }


    function addPermission(permissionName, description, menuName, parentId) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('permissionModal'));

        db.run(
            `INSERT INTO permissions (permission_name, description, menu_name, parent_id)
             VALUES (?, ?, ?, ?)`,
            [permissionName, description, menuName, parentId],
            function (err) {
                if (err) {
                    return console.error('Error al añadir permiso:', err.message);
                }
                alert('Permiso añadido con éxito');
                fetchPermissions();
                modal.hide(); // Cerrar el modal
            }
        );
    }

    function updatePermission(id, permissionName, description, menuName, parentId) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('permissionModal'));

        db.run(
            `UPDATE permissions
             SET permission_name = ?,
                 description     = ?,
                 menu_name       = ?,
                 parent_id       = ?
             WHERE permission_id = ?`,
            [permissionName, description, menuName, parentId, id],
            function (err) {
                if (err) {
                    return console.error('Error al actualizar permiso:', err.message);
                }
                alert('Permiso actualizado con éxito');
                fetchPermissions();
                modal.hide(); // Cerrar el modal
            }
        );
    }


    function fetchPermissions() {
        db.all(
            `SELECT p.permission_id,
                    p.permission_name,
                    p.description,
                    p.menu_name,
                    parent.permission_name AS parent_name
             FROM permissions p
                      LEFT JOIN permissions parent ON p.parent_id = parent.permission_id`,
            [],
            (err, rows) => {
                if (err) {
                    return console.error('Error al obtener permisos:', err.message);
                }
                const permissionList = document.getElementById('permission-list');
                permissionList.innerHTML = '';
                rows.forEach((permission) => {
                    permissionList.innerHTML += `
          <tr>
            <td>${permission.permission_id}</td>
            <td>${permission.permission_name}</td>
            <td>${permission.description}</td>
            <td>${permission.menu_name}</td>
            <td>${permission.parent_name || 'Ninguno'}</td>
            <td>
              <button class="btn btn-sm btn-warning edit-permission" data-id="${permission.permission_id}" 
                      data-name="${permission.permission_name}" 
                      data-description="${permission.description}" 
                      data-menu="${permission.menu_name}" 
                      data-parent="${permission.parent_id || ''}">Editar</button>
              <button class="btn btn-sm btn-danger delete-permission" data-id="${permission.permission_id}">Eliminar</button>
            </td>
          </tr>
        `;
                });

                // Asignar los event listeners para editar y eliminar
                document.querySelectorAll('.edit-permission').forEach((button) => {
                    button.addEventListener('click', () => {
                        const id = button.getAttribute('data-id');
                        const name = button.getAttribute('data-name');
                        const description = button.getAttribute('data-description');
                        const menu = button.getAttribute('data-menu');
                        const parent = button.getAttribute('data-parent');

                        editPermission(id, name, description, menu, parent);
                    });
                });

                document.querySelectorAll('.delete-permission').forEach((button) => {
                    button.addEventListener('click', () => {
                        const id = button.getAttribute('data-id');
                        confirmDeletePermission(id);
                    });
                });
            }
        );
    }


    function editPermission(id, permissionName, description, menuName, parentId) {
        currentEditId = id;
        document.getElementById('permissionName').value = permissionName;
        document.getElementById('description').value = description;
        document.getElementById('menuName').value = menuName;

        // Llenar las opciones de permisos padres y seleccionar el actual
        populateParentOptions(currentEditId);
        setTimeout(() => {
            document.getElementById('parentId').value = parentId;
        }, 100); // Esperar a que se carguen las opciones

        document.getElementById('permissionModalLabel').textContent = 'Editar Permiso';
        new bootstrap.Modal(document.getElementById('permissionModal')).show();
    }


    function confirmDeletePermission(id) {
        currentEditId = id;
        document.getElementById('deletePermissionMessage').textContent = '¿Está seguro de que desea eliminar este permiso?';
        const modal = new bootstrap.Modal(document.getElementById('confirmDeletePermissionModal'));
        modal.show();

        document.getElementById('confirmDeletePermissionBtn').onclick = () => {
            deletePermission(currentEditId, modal);
        };
    }

    function deletePermission(id, modal) {
        db.run(`DELETE
                FROM permissions
                WHERE permission_id = ?`, [id], function (err) {
            if (err) {
                if (err.message.includes('FOREIGN KEY constraint failed')) {
                    alert('No se puede eliminar el permiso porque tiene dependencias.');
                } else {
                    console.error('Error al eliminar permiso:', err.message);
                }
                return;
            }
            alert('Permiso eliminado con éxito');
            fetchPermissions();
            modal.hide(); // Cerrar el modal de confirmación
        });
    }

});


