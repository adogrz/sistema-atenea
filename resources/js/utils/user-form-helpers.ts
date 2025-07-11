export const doesRoleRequireArea = (roles: Array<{ name: string; is_primary: boolean; expires_at?: string }>): boolean => {
    const rolesRequiringArea = ['coordinador-area', 'mentor', 'instructor', 'calificador'];
    return roles.some((role) => rolesRequiringArea.includes(role.name));
};
