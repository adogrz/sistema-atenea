import { useState } from 'react';

interface Role {
    name: string;
    is_primary: boolean;
    expires_at?: string;
}

export default function useRolesManagement(initialRoles: Role[] = [], onRolesChange: (roles: Role[]) => void) {
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [primaryRoleIndex, setPrimaryRoleIndex] = useState<number>(0);

    const parseLocalDate = (dateString: string): Date => {
        const [year, month, day] = dateString.split('-').map((num) => parseInt(num, 10));
        return new Date(year, month - 1, day);
    };

    const handleAddRole = (roleName: string) => {
        if (!roleName || initialRoles.some((r) => r.name === roleName)) return;

        const newRoles = [...initialRoles];
        const isFirst = newRoles.length === 0;

        newRoles.push({
            name: roleName,
            is_primary: isFirst,
        });

        onRolesChange(newRoles);
        setSelectedRole('');
    };

    const handleRemoveRole = (index: number) => {
        const newRoles = [...initialRoles];
        newRoles.splice(index, 1);

        if (initialRoles[index].is_primary && newRoles.length > 0) {
            newRoles[0].is_primary = true;
            setPrimaryRoleIndex(0);
        }

        onRolesChange(newRoles);
    };

    const handleSetPrimaryRole = (index: number) => {
        const newRoles = [...initialRoles];

        newRoles.forEach((role) => (role.is_primary = false));
        newRoles[index].is_primary = true;
        setPrimaryRoleIndex(index);

        onRolesChange(newRoles);
    };

    const handleSetExpiryDate = (index: number, date: Date | undefined) => {
        const newRoles = [...initialRoles];

        if (date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            newRoles[index].expires_at = `${year}-${month}-${day}`;
        } else {
            delete newRoles[index].expires_at;
        }

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
