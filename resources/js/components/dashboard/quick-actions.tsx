import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { router } from '@inertiajs/react';
import { Brain, FileHeart, Plus, Stethoscope, Users } from 'lucide-react';

interface QuickAction {
    title: string;
    description: string;
    icon: 'medical' | 'psychological' | 'assignments' | 'users' | 'plus';
    route: string;
    variant?: 'default' | 'outline' | 'secondary';
}

interface QuickActionsProps {
    actions: QuickAction[];
    title?: string;
}

const iconMap = {
    medical: Stethoscope,
    psychological: Brain,
    assignments: FileHeart,
    users: Users,
    plus: Plus,
};

export function QuickActions({ actions, title = 'Acciones Rápidas' }: QuickActionsProps) {
    const handleAction = (routeName: string) => {
        router.get(route(routeName));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>Accede rápidamente a las funciones más utilizadas</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                    {actions.map((action, index) => {
                        const Icon = iconMap[action.icon];
                        return (
                            <Button
                                key={index}
                                variant={action.variant || 'outline'}
                                className="h-auto flex-col items-start gap-2 p-4"
                                onClick={() => handleAction(action.route)}
                            >
                                <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    <span className="font-semibold">{action.title}</span>
                                </div>
                                <span className="text-left text-xs text-muted-foreground">{action.description}</span>
                            </Button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
