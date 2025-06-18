
import { PageProps } from '@inertiajs/core';

// resources/js/types/SharedData.ts
export interface SharedData extends PageProps {
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
      roles: string[]; // <- importante para condicionar vistas
    } | null;
  };
}