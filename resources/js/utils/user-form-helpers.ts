const rolesRequiringArea = ['coordinador-area', 'mentor', 'instructor', 'calificador'];

export const doesRoleRequireArea = (roles: Array<{ name: string; is_primary: boolean; expires_at?: string }>): boolean => {
    return roles.some((role) => rolesRequiringArea.includes(role.name));
};
