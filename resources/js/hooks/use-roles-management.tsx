import { useCallback, useEffect, useState } from 'react';

interface Role {
    name: string;
    is_primary: boolean;
    expires_at?: string;
}

export default function useRolesManagement(roles: Role[] = [], onRolesChange: (roles: Role[]) => void) {
    const [selectedRole, setSelectedRole] = useState<string>('');

    // El índice del rol primario es un estado derivado de los roles, no un estado propio.
    const primaryRoleIndex = roles.findIndex((role) => role.is_primary);

    // useCallback para crear una versión memoizada de la función, evitando re-renders.
    const handleSetPrimaryRole = useCallback(
        (index: number) => {
            if (index < 0 || index >= roles.length || roles[index].is_primary) {
                return; // No hacer nada si el índice es inválido o el rol ya es primario
            }

            const newRoles = roles.map((role, i) => ({
                ...role,
                is_primary: i === index,
            }));

            onRolesChange(newRoles);
        },
        [roles, onRolesChange],
    );

    // Efecto para asegurar que siempre haya un rol primario si hay roles en la lista.
    useEffect(() => {
        if (roles.length > 0 && primaryRoleIndex === -1) {
            // Si no se encuentra ningún primario, se establece el primero por defecto.
            handleSetPrimaryRole(0);
        }
    }, [roles, primaryRoleIndex, handleSetPrimaryRole]);

    const parseLocalDate = (dateString: string): Date => {
        const [year, month, day] = dateString.split('-').map((num) => parseInt(num, 10));
        return new Date(year, month - 1, day);
    };

    const handleAddRole = (roleName: string) => {
        if (!roleName || roles.some((r) => r.name === roleName)) return;

        const newRole: Role = {
            name: roleName,
            is_primary: roles.length === 0, // El primer rol agregado se vuelve primario.
            expires_at: undefined,
        };

        onRolesChange([...roles, newRole]);
        setSelectedRole('');
    };

    const handleRemoveRole = (index: number) => {
        const roleToRemove = roles[index];
        let newRoles = roles.filter((_, i) => i !== index);

        // Si el rol eliminado era primario y quedan más roles, se asigna un nuevo primario.
        if (roleToRemove.is_primary && newRoles.length > 0) {
            newRoles = newRoles.map((role, i) => ({
                ...role,
                is_primary: i === 0, // El primero de la lista restante se vuelve primario.
            }));
        }

        onRolesChange(newRoles);
    };

    const handleSetExpiryDate = (index: number, date: Date | null) => {
        const newRoles = roles.map((role, i) => {
            if (i === index) {
                return {
                    ...role,
                    expires_at: date ? date.toISOString().split('T')[0] : undefined,
                };
            }
            return role;
        });
        onRolesChange(newRoles);
    };

    return {
        selectedRole,
        setSelectedRole,
        primaryRoleIndex,
        parseLocalDate,
        handleAddRole,
        handleRemoveRole,
        handleSetPrimaryRole,
        handleSetExpiryDate,
    };
}
