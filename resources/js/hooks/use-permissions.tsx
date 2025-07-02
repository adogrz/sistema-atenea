import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';

export function usePermissions() {
    const { auth } = usePage<PageProps>().props;

    const hasPermission = (permissionName: string): boolean => {
        // Si no hay usuario autenticado, no tiene permisos
        if (!auth.user) {
            console.log('No hay usuario autenticado');
            return false;
        }

        // Verificar los permisos específicos
        if (!auth.user.permissions || !Array.isArray(auth.user.permissions)) {
            console.log('El usuario no tiene permisos o no están en formato array');
            return false;
        }

        const hasSpecificPermission = auth.user.permissions.some((p) => p.name === permissionName);
        console.log(`Verificando permiso específico ${permissionName}: ${hasSpecificPermission ? 'SÍ' : 'NO'}`);

        return hasSpecificPermission;
    };

    const hasRole = (roleName: string): boolean => {
        if (!auth.user?.roles || !Array.isArray(auth.user.roles)) {
            return false;
        }
        return auth.user.roles.some((r) => r.name.toLowerCase() === roleName.toLowerCase());
    };

    // Función de depuración para verificar los permisos y roles del usuario
    const debugPermissions = () => {
        console.log('Usuario:', auth.user?.name);
        console.log('Roles:', auth.user?.roles);
        console.log('Permisos:', auth.user?.permissions);
        return {
            user: auth.user?.name,
            roles: auth.user?.roles,
            permissions: auth.user?.permissions,
        };
    };

    return { hasPermission, hasRole, debugPermissions };
}
