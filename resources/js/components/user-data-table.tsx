import { DataTable } from '@/components/ui/data-table';
import { getUserColumns, type User } from '@/components/user-columns';
import { useState } from 'react';

export default function UserDataTable({ users }: { users: User[] }) {
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    if (users.length === 0) {
        return <div className="py-4 text-center text-muted-foreground">No hay usuarios disponibles</div>;
    }

    return (
        <DataTable
            columns={getUserColumns(users, selectedUserId, setSelectedUserId)}
            data={users}
            selectedRowId={selectedUserId}
            onRowClick={(user) => setSelectedUserId(user.id)}
            getRowId={(user) => user.id}
        />
    );
}
