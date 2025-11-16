import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { usePermissions } from '@/hooks/use-permissions';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Brain,
    Calendar,
    CalendarDays,
    ClipboardCheck,
    ClipboardListIcon,
    Trophy,
    FileBarChart,
    FileCheck,
    FileHeart,
    GraduationCap,
    GraduationCapIcon,
    HouseIcon,
    LayoutDashboard,
    School,
    ShieldCheck,
    Stethoscope,
    UserCheck,
    UserPlus,
    Users,
} from 'lucide-react';

import AppLogo from './app-logo';

export function AppSidebar() {
    const { hasPermission, hasRole } = usePermissions();
    const { url } = usePage();

    const isItemActive = (href: string | undefined) => {
        if (href === '/' || href === '/dashboard') {
            return url === href;
        }
        return url.startsWith(href as string);
    };

    const navStructure: NavItem[] = [
        { title: 'Inicio', href: '/dashboard', icon: HouseIcon },
        ...buildClinicalRecordsNav(),
        ...buildAdministrationNav(),
        ...buildAcademicNav(),
        ...buildOlimpiadasNav(),
        ...buildInternshipNav(),
        ...buildStudentNav(),
    ].filter((item) => !item.items || item.items.length > 0);

    function buildClinicalRecordsNav(): NavItem[] {
        if (!hasPermission('clinical-records:view-module')) return [];

        const canManageMedical = hasPermission('assignments:manage-medical');
        const canManagePsychological = hasPermission('assignments:manage-psychological');

        const items: NavItem[] = [];

        if (canManageMedical) {
            items.push({
                icon: Stethoscope,
                href: '/dashboard/clinical-records/medical-records',
                title: 'Expedientes Médicos',
            });
        }

        if (canManagePsychological) {
            items.push({
                icon: Brain,
                href: '/dashboard/clinical-records/psychological-records',
                title: 'Expedientes Psicológicos',
            });
        }

        items.push({
            icon: Users,
            href: '/dashboard/clinical-records/assignments',
            title: canManageMedical || canManagePsychological ? 'Asignaciones' : 'Mis Estudiantes',
        });

        return items.length > 0
            ? [
                  {
                      title: 'Expediente Clínico',
                      icon: FileHeart,
                      items,
                  },
              ]
            : [];
    }

    function buildAdministrationNav(): NavItem[] {
        const items = [
            hasPermission('users:list') && { title: 'Usuarios', href: '/dashboard/users', icon: Users },
            hasPermission('audit:view') && { title: 'Auditoría', href: '/dashboard/audit', icon: ClipboardListIcon },
        ].filter(Boolean) as NavItem[];

        return items.length > 0 ? [{ title: 'Administración', icon: ShieldCheck, items }] : [];
    }

    function buildAcademicNav(): NavItem[] {
        if (!hasPermission('academic:view')) return [];

        return [
            {
                title: 'Académico',
                icon: School,
                items: [
                    { title: 'Panel Académico', href: '/dashboard/academico', icon: LayoutDashboard },
                    { title: 'Calendario', href: '/dashboard/calendario', icon: CalendarDays },
                ],
            },
        ];
    }

    function buildOlimpiadasNav(): NavItem[] {
    // Si no tiene ningún permiso relevante, no mostramos nada
    const canView = 
        hasPermission('olimpiadas:list') ||
        hasPermission('resultados:view') ||
        hasPermission('academic:view') ||
        hasRole('calificador') ||
        hasPermission('calificadores:assign') ||
        hasPermission('definiciones-evaluacion:list') ||
        hasPermission('grupos:list');

    if (!canView) return [];

    const items = [];

    if (hasPermission('olimpiadas:list')) {
        items.push(
            { title: 'Olimpiadas y Fases', href: route('olimpiadas.index'), icon: GraduationCap },
            { title: 'Inscripciones', href: route('inscripciones.gestion'), icon: LayoutDashboard }
        );
    }

    if (hasPermission('resultados:view')) {
        items.push({ title: 'Resultados', href: route('resultados.index'), icon: Trophy });
    }

    if (hasPermission('academic:view')) {
        items.push({ title: 'Centro de Control', href: route('area.dashboard'), icon: LayoutDashboard });
    }

    if (hasRole('calificador')) {
        items.push({ title: 'Dashboard de Calificador', href: route('calificaciones.olimpiadas.index'), icon: ClipboardListIcon });
    }

    if (hasPermission('calificadores:assign')) {
        items.push({ title: 'Asignación de Evaluadores', href: route('gestion-evaluacion.index'), icon: ShieldCheck });
    }

    if (hasPermission('definiciones-evaluacion:list')) {
        items.push({ title: 'Definiciones de Evaluación', href: route('definiciones-evaluacion.index'), icon: ClipboardListIcon });
    }

    if (hasPermission('grupos:list')) {
        items.push({ title: 'Gestión de Grupos', href: route('grupos.index'), icon: Users });
    }

    return [
        {
            title: 'Olimpiadas',
            icon: Trophy,
            items,
        },
    ];
}

    function buildInternshipNav(): NavItem[] {
        const canViewModule =
            hasPermission('internado:view') ||
            hasPermission('internado:admin:view') ||
            hasPermission('internado:asistencias:view');

        if (!canViewModule) return [];

        const items: NavItem[] = [
            ...(hasPermission('internado:admin:view')
                ? [
                      { title: 'Selección FDTC', href: '/dashboard/internado-fdtc/seleccion', icon: UserPlus },
                      { title: 'Participantes', href: '/dashboard/internado-fdtc/participantes', icon: Users },
                      { title: 'Periodos', href: '/dashboard/internado-fdtc/periodos', icon: Calendar },
                  ]
                : []),
            ...(hasPermission('internado:evaluaciones:view')
                ? [{ title: 'Evaluaciones', href: '/dashboard/internado-fdtc/evaluaciones', icon: FileCheck }]
                : []),
            ...(hasPermission('internado:asistencias:view')
                ? [
                      { title: 'Asistencias', href: '/dashboard/internado-fdtc/asistencias', icon: UserCheck },
                      { title: 'Reporte Asistencias', href: '/dashboard/internado-fdtc/asistencias/reporte', icon: FileBarChart },
                  ]
                : []),
            ...(hasPermission('internado:conductas:view')
                ? [
                      { title: 'Conductas', href: '/dashboard/internado-fdtc/conductas', icon: ClipboardCheck },
                      { title: 'Reporte Conductas', href: '/dashboard/internado-fdtc/conductas/reporte', icon: FileBarChart },
                  ]
                : []),
        ];

        return items.length > 0 ? [{ title: 'FDTC', icon: ShieldCheck, items }] : [];
    }

    function buildStudentNav(): NavItem[] {
        if (!hasPermission('profile:view')) return [];

        return [
            {
                title: 'Estudiante',
                icon: GraduationCapIcon,
                items: [
                    { title: 'Inscripciones', href: '/dashboard/inscripciones', icon: LayoutDashboard },
                    { title: 'Calendario', href: '/dashboard/calendario', icon: Calendar },
                ],
            },
        ];
    }

    const mainNavItems = navStructure
        .filter((item) => !item.items || item.items.length > 0)
        .map((item) => {
            const isGroup = !!item.items;
            const groupIsOpen = isGroup ? item.items!.some((sub) => isItemActive(sub.href)) : false;

            return {
                ...item,
                isActive: !isGroup && isItemActive(item.href),
                isOpen: groupIsOpen,
                items: item.items?.map((subItem) => ({
                    ...subItem,
                    isActive: isItemActive(subItem.href),
                })),
            };
        });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" preserveState>
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