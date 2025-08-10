'use client';

import { Button } from '@/components/ui/button';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@radix-ui/react-separator';
import { HelpCircle } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

export default function DatosResponsables() {
    const form = useFormContext();

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold">Datos de los responsables</h3>
                <p className="mt-1 text-sm text-muted-foreground">A continuación se solicitan los datos del responsable del aspirante</p>
            </div>

            {/* Información del responsable 1 */}
            <div className="space-y-6">
                <h4 className="text-base font-medium">Información del responsable (Obligatorio)</h4>

                {/* DUI */}
                <FormField
                    control={form.control}
                    name="dui_responsable_1"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center justify-between">
                                <FormLabel>DUI del responsable</FormLabel>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-5 w-5">
                                                <HelpCircle className="h-4 w-4" />
                                                <span className="sr-only">Ayuda</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Ingresa el número de identificación único del responsable (DUI)</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <FormControl>
                                <Input placeholder="000000-0" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Nombres */}
                <FormField
                    control={form.control}
                    name="nombres_responsable_1"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center justify-between">
                                <FormLabel>Nombres</FormLabel>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-5 w-5">
                                                <HelpCircle className="h-4 w-4" />
                                                <span className="sr-only">Ayuda</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Nombres del responsable</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <FormControl>
                                <Input placeholder="Ej. María José" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Apellidos */}
                <FormField
                    control={form.control}
                    name="apellidos_responsable_1"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center justify-between">
                                <FormLabel>Apellidos</FormLabel>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-5 w-5">
                                                <HelpCircle className="h-4 w-4" />
                                                <span className="sr-only">Ayuda</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Apellidos del responsable</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <FormControl>
                                <Input placeholder="Ej. Gutiérrez Domínguez" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Parentesco */}
                <FormField
                    control={form.control}
                    name="tipo_parentesco_1"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tipo de Parentesco</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una opción" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Madre">Madre</SelectItem>
                                    <SelectItem value="Padre">Padre</SelectItem>
                                    <SelectItem value="Tio">Tío/a</SelectItem>
                                    <SelectItem value="Abuelo">Abuelo/a</SelectItem>
                                    <SelectItem value="Tutor legal">Tutor legal</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Correo electrónico */}
                <FormField
                    control={form.control}
                    name="email_responsable_1"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center justify-between">
                                <FormLabel>Correo electrónico - Opcional</FormLabel>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-5 w-5">
                                                <HelpCircle className="h-4 w-4" />
                                                <span className="sr-only">Ayuda</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Recibirás notificaciones importantes en este correo</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <FormControl>
                                <Input type="email" placeholder="tu.correo@ejemplo.com" {...field} />
                            </FormControl>
                            <FormDescription>Otro medio con el cual contactar al responsable</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Teléfono */}
                <FormField
                    control={form.control}
                    name="telefono_responsable_1"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Teléfono de contacto</FormLabel>
                            <FormControl>
                                <Input type="tel" placeholder="Ej. 12345678" {...field} />
                            </FormControl>
                            <FormDescription>Ingresa un número de teléfono con el cual podamos contactarte</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Separator className="my-6" />

                {/* Información del responsable 2 */}
                <div className="space-y-6">
                    <h4 className="text-base font-medium">Información del responsable 2 (Opcional)</h4>

                    {/* DUI Responsable 2 */}
                    <FormField
                        control={form.control}
                        name="dui_responsable_2"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between">
                                    <FormLabel>DUI del responsable</FormLabel>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-5 w-5">
                                                    <HelpCircle className="h-4 w-4" />
                                                    <span className="sr-only">Ayuda</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Ingresa el número de identificación único del segundo responsable (DUI)</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <FormControl>
                                    <Input placeholder="000000-0" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Nombres Responsable 2 */}
                    <FormField
                        control={form.control}
                        name="nombres_responsable_2"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between">
                                    <FormLabel>Nombres</FormLabel>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-5 w-5">
                                                    <HelpCircle className="h-4 w-4" />
                                                    <span className="sr-only">Ayuda</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Nombres del responsable</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <FormControl>
                                    <Input placeholder="Ej. Carlos Alberto" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Apellidos Responsable 2 */}
                    <FormField
                        control={form.control}
                        name="apellidos_responsable_2"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between">
                                    <FormLabel>Apellidos</FormLabel>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-5 w-5">
                                                    <HelpCircle className="h-4 w-4" />
                                                    <span className="sr-only">Ayuda</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Apellidos del responsable</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <FormControl>
                                    <Input placeholder="Ej. Gutiérrez Domínguez" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Parentesco Responsable 2 */}
                    <FormField
                        control={form.control}
                        name="tipo_parentesco_2"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Parentesco</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona una opción" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Madre">Madre</SelectItem>
                                        <SelectItem value="Padre">Padre</SelectItem>
                                        <SelectItem value="Tio">Tío/a</SelectItem>
                                        <SelectItem value="Abuelo">Abuelo/a</SelectItem>
                                        <SelectItem value="Tutor legal">Tutor legal</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Correo electrónico Responsable 2 */}
                    <FormField
                        control={form.control}
                        name="email_responsable_2"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between">
                                    <FormLabel>Correo electrónico - Opcional</FormLabel>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-5 w-5">
                                                    <HelpCircle className="h-4 w-4" />
                                                    <span className="sr-only">Ayuda</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Recibirás notificaciones importantes en este correo</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <FormControl>
                                    <Input type="email" placeholder="tu.correo@ejemplo.com" {...field} />
                                </FormControl>
                                <FormDescription>Otro medio con el cual contactar al responsable</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Teléfono Responsable 2 */}
                    <FormField
                        control={form.control}
                        name="telefono_responsable_2"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Teléfono de contacto</FormLabel>
                                <FormControl>
                                    <Input type="tel" placeholder="Ej. 12345678" {...field} />
                                </FormControl>
                                <FormDescription>Ingresa un número de teléfono con el cual podamos contactarte</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </div>
    );
}
