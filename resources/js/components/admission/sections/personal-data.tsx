'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BookOpen, GraduationCap, HelpCircle, Users } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

export default function DatosPersonales() {
    const form = useFormContext();

    return (
        <div className="space-y-6">
            {/* Banner informativo del programa */}
            <Alert className="border-primary/20 bg-primary/5">
                <GraduationCap className="h-5 w-5 text-primary" />
                <AlertDescription className="text-sm">
                    <div className="space-y-2">
                        <p className="font-semibold text-primary">Programa Jóvenes Talento - Instituto Especializado de Educación Superior Atenea</p>
                        <p className="text-muted-foreground">
                            Postúlate para formar parte de nuestro programa especializado en tecnología e innovación. Este proceso de admisión
                            evaluará tu perfil académico y aptitudes para las carreras disponibles.
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>Proceso 2025</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                <span>Carreras técnicas y superiores</span>
                            </div>
                        </div>
                    </div>
                </AlertDescription>
            </Alert>

            <div className="space-y-6">
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Datos Personales</h3>
                    <p className="text-sm text-muted-foreground">Ingresa tus datos personales para iniciar tu solicitud de admisión</p>
                </div>
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Nombres */}
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="primer_nombre"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel>Primer nombre</FormLabel>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-5 w-5">
                                                            <HelpCircle className="h-4 w-4" />
                                                            <span className="sr-only">Ayuda</span>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="max-w-xs">Ingresa el primer nombre del aspirante</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <FormControl>
                                            <Input placeholder="Ej. Juan" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="segundo_nombre"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel>Segundo nombre</FormLabel>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-5 w-5">
                                                            <HelpCircle className="h-4 w-4" />
                                                            <span className="sr-only">Ayuda</span>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="max-w-xs">Ingresa el segundo nombre del aspirante</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <FormControl>
                                            <Input placeholder="Ej. Antonio" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Apellidos */}
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="primer_apellido"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel>Primer apellido</FormLabel>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-5 w-5">
                                                            <HelpCircle className="h-4 w-4" />
                                                            <span className="sr-only">Ayuda</span>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="max-w-xs">Ingresa el primer apellido del aspirante</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <FormControl>
                                            <Input placeholder="Ej. Pérez" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Segundo apellido */}
                            <FormField
                                control={form.control}
                                name="segundo_apellido"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel>Segundo apellido</FormLabel>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-5 w-5">
                                                            <HelpCircle className="h-4 w-4" />
                                                            <span className="sr-only">Ayuda</span>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="max-w-xs">Ingresa el segundo apellido del aspirante</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <FormControl>
                                            <Input placeholder="Ej. González" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Fecha de nacimiento */}
                    <FormField
                        control={form.control}
                        name="fecha_nacimiento"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <div className="flex items-center justify-between">
                                    <FormLabel>Selecciona una fecha de nacimiento</FormLabel>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-5 w-5">
                                                    <HelpCircle className="h-4 w-4" />
                                                    <span className="sr-only">Ayuda</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-xs">Selecciona la fecha de nacimiento del aspirante</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <DatePicker
                                    value={field.value ? new Date(field.value) : undefined}
                                    onChange={(date) => field.onChange(date ? date.toISOString().slice(0, 10) : '')}
                                    placeholder="Fecha de nacimiento"
                                    disableDates={(date) => date > new Date()}
                                    format={(date) =>
                                        date.toLocaleDateString('es-ES', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                        })
                                    }
                                />
                                <FormDescription>Debes seleccionar una fecha de nacimiento</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Sexo */}
                    <FormField
                        control={form.control}
                        name="sexo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sexo</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona una opción" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="H">Hombre</SelectItem>
                                        <SelectItem value="M">Mujer</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Email */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between">
                                    <FormLabel>Correo electrónico - Este correo será utilizado para acceder a la plataforma</FormLabel>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-5 w-5">
                                                    <HelpCircle className="h-4 w-4" />
                                                    <span className="sr-only">Ayuda</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-xs">
                                                    Este correo sera utilizado para crear tu cuenta y gestionar tu acceso a la plataforma. Recibirás
                                                    notificaciones importantes en este correo.
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <FormControl>
                                    <Input type="email" placeholder="tu.correo@ejemplo.com" {...field} />
                                </FormControl>
                                <FormDescription>Recibirás un correo de confirmación en esta correo electrónico</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </div>
    );
}
