import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';

export function usePermissions() {
    const { auth } = usePage<PageProps>().props;

    /**
     * Verifica si el usuario tiene un permiso específico
     */
    const hasPermission = (permissionName: string): boolean => {
        // Si no hay usuario autenticado, no tiene permisos
        if (!auth.user) {
            return false;
        }

        // Verificar los permisos específicos
        if (!auth.user.permissions || !Array.isArray(auth.user.permissions)) {
            return false;
        }

        // Verificar si el permiso existe en el array de permisos
        return auth.user.permissions.some((p: string | { name: string }) =>
            typeof p === 'string' ? p === permissionName : p.name === permissionName,
        );
    };

    /**
     * Verifica si el usuario tiene un rol específico
     */
    const hasRole = (roleName: string): boolean => {
        if (!auth.user?.roles || !Array.isArray(auth.user.roles)) {
            return false;
        }

        return auth.user.roles.some((r) => r.name.toLowerCase() === roleName.toLowerCase());
    };

    /**
     * Obtiene información de un rol temporal
     */
    const getTemporaryRoleInfo = (roleName: string) => {
        if (!auth.user?.roles || !Array.isArray(auth.user.roles)) {
            return null;
        }

        const role = auth.user.roles.find((r) => r.name === roleName);
        if (!role || !role.pivot) {
            return null;
        }

        return {
            expiresAt: role.pivot.expires_at ? new Date(role.pivot.expires_at) : null,
            isPrimary: role.pivot.is_primary || false,
        };
    };

    /**
     * Verifica si un rol ha expirado
     */
    const isRoleExpired = (roleName: string): boolean => {
        const info = getTemporaryRoleInfo(roleName);
        if (!info || !info.expiresAt) {
            return false;
        }

        return new Date() > info.expiresAt;
    };

    /**
     * Obtiene el rol primario del usuario
     */
    const getPrimaryRole = () => {
        if (!auth.user?.roles || !Array.isArray(auth.user.roles)) {
            return null;
        }

        return auth.user.roles.find((r) => r.pivot?.is_primary);
    };

    /**
     * Obtiene la sede del usuario
     */
    const getUserSede = () => {
        if (!auth.user) return null;
        return auth.user.sede_name;
    };

    /**
     * Obtiene las áreas del usuario
     */
    const getUserAreas = () => {
        if (!auth.user?.areas || !Array.isArray(auth.user.areas)) {
            return [];
        }
        return auth.user.areas;
    };

    /**
     * Verifica si el usuario está restringido a su sede
     */
    const isRestrictedToSede = () => {
        return hasPermission('users:view-sede');
    };

    /**
     * Verifica si el usuario está restringido a sus áreas
     */
    const isRestrictedToArea = () => {
        return hasPermission('users:view-area');
    };

    /**
     * Función de depuración para verificar los permisos y roles del usuario
     */
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

    return {
        hasPermission,
        hasRole,
        getTemporaryRoleInfo,
        isRoleExpired,
        getPrimaryRole,
        getUserSede,
        getUserAreas,
        isRestrictedToSede,
        isRestrictedToArea,
        debugPermissions,
    };
}
