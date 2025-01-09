-- Insertar permisos
INSERT INTO permissions (permission_id, permission_name, description, menu_name, parent_id)
VALUES (1, 'Ver Usuarios', 'Permite ver la lista de usuarios', 'nav-users', NULL),
       (2, 'Añadir Usuarios', 'Permite añadir nuevos usuarios', 'add-user', 1),
       (3, 'Editar Usuarios', 'Permite editar usuarios existentes', 'edit-user', 1),
       (4, 'Eliminar Usuarios', 'Permite eliminar usuarios', 'delete-user', 1),
       (5, 'Actualizar Contraseña', 'Permite actualizar la contraseña de un usuario', 'update-password', 1),

       (6, 'Ver Roles', 'Permite ver la lista de roles', 'nav-roles', NULL),
       (7, 'Añadir Roles', 'Permite añadir nuevos roles', 'add-role', 6),
       (8, 'Editar Roles', 'Permite editar roles existentes', 'edit-role', 6),
       (9, 'Eliminar Roles', 'Permite eliminar roles', 'delete-role', 6),

       (10, 'Ver Permisos', 'Permite ver la lista de permisos', 'nav-permissions', NULL),
       (11, 'Añadir Permisos', 'Permite añadir nuevos permisos', 'add-permission', 10),
       (12, 'Editar Permisos', 'Permite editar permisos existentes', 'edit-permission', 10),
       (13, 'Eliminar Permisos', 'Permite eliminar permisos', 'delete-permission', 10);

-- Asociar todos los permisos al rol Admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, permission_id FROM permissions;

-- El rol Vendedor no recibe permisos por ahora (no se inserta nada)
-- Insertar roles
INSERT INTO roles (role_id, role_name) VALUES
                                           (1, 'Admin'),
                                           (2, 'Vendedor');
