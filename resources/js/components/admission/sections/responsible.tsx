"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { Separator } from "@radix-ui/react-separator";

export default function DatosResponsables() {
  const form = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos de los responsables</CardTitle>
        <CardDescription>
          A continuación se solicitan los datos del responsable del aspirante
        </CardDescription>
      </CardHeader>

      {/* Información del responsable 1 */}
      <CardContent className="space-y-6">
        <CardTitle>
          Información del responsable (Obligatorio)
        </CardTitle>

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
                <Input placeholder="Ej. Adalberto Santiago" {...field} />
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
              <FormDescription>
                Otro medio con el cual contactar al responsable
              </FormDescription>
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
              <FormDescription>
                Ingresa un número de teléfono con el cual podamos contactarte
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent >

      {/* Separador */}
      <Separator className="my-3" />

      {/* Información del responsable 2 */}
      <CardContent className="space-y-3">
        <CardTitle>
          Segundo responsable (Opcional)
        </CardTitle>
        <CardDescription>
          Esta sección es opcional, pero se recomienda completarla para tener un contacto adicional en caso de emergencia.
        </CardDescription>

        {/* DUI */}
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
                <Input placeholder="Ej. Adalberto Santiago" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Apellidos */}
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

        {/* Parentesco */}
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

        {/* Correo electrónico */}
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
              <FormDescription>
                Otro medio con el cual contactar al responsable
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Teléfono */}
        <FormField
          control={form.control}
          name="telefono_responsable_2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono de contacto</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="Ej. 12345678" {...field} />
              </FormControl>
              <FormDescription>
                Ingresa un número de teléfono con el cual podamos contactarte
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

      </CardContent >
    </Card >
  );
}