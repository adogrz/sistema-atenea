import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { SharedData } from '@/types/SharedData';
import { Link, usePage } from '@inertiajs/react';
import { ClipboardListIcon, HouseIcon, User } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;

    // Verificación más robusta del rol de administrador
    const isAdmin =
        auth.user?.role_name === 'admin' ||
        (auth.user?.roles &&
            Array.isArray(auth.user.roles) &&
            (auth.user.roles.includes('admin') ||
                auth.user.roles.some(
                    (role) => (typeof role === 'string' && role === 'admin') || (typeof role === 'object' && role?.name === 'admin'),
                )));

    // Verificación más robusta para el rol de usuario normal
    const isNormalUser =
        auth.user?.role_name === 'Usuario' ||
        (auth.user?.roles &&
            Array.isArray(auth.user.roles) &&
            (auth.user.roles.includes('Usuario') ||
                auth.user.roles.some(
                    (role) => (typeof role === 'string' && role === 'Usuario') || (typeof role === 'object' && role?.name === 'Usuario'),
                )));

    // Elementos comunes para todos los usuarios
    const mainNavItems: NavItem[] = [
        // Inicio se muestra para todos los usuarios
        { title: 'Inicio', href: '/home', icon: HouseIcon },

        // Elementos solo para administradores
        ...(isAdmin
            ? [
                  { title: 'Auditoria', href: '/dashboard', icon: ClipboardListIcon },
                  { title: 'Usuarios', href: '/dashboard/usuarios', icon: User },
              ]
            : []),

        // Elementos solo para usuarios normales
        ...(isNormalUser ? [{ title: 'Mi perfil', href: '/perfil', icon: User }] : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
