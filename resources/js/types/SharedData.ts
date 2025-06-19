import { PageProps } from '@inertiajs/core';

export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  permissions: string[]; // Direct permissions + role permissions
}

export interface SharedData extends PageProps {
  auth: {
    user: User | null;
  };
  config: {
    app_name: string;
    app_env: string;// Add other shared config values
  };
}