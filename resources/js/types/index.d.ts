import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Permission {
    id: number;
    name: string;
}

export interface RolePivot {
    is_primary: boolean;
    expires_at: string | null;
}

export interface Role {
    pivot?: RolePivot;
    id: number;
    name: string;
    description: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    status: string;
    permissions?: Permission[];
    roles?: Role[];

    [key: string]: unknown;
}

export interface Auth {
    user: User | null;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavItem {
    title: string;
    href?: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    isOpen?: boolean;
    items?: NavItem[];
}

export interface SelectItem {
    name: string;
    description: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;

    [key: string]: unknown;
}

import { DefinicionEvaluacion, ItemDefinido } from './olympics';

export type PageProps = SharedData & {
    definicionEvaluacion?: DefinicionEvaluacion;
    definiciones?: DefinicionEvaluacion[];
    itemDefinido?: ItemDefinido;
};
