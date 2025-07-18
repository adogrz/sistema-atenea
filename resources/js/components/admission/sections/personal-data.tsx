"use client"

import { useFormContext } from "react-hook-form";
import { CalendarIcon, HelpCircle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function DatosPersonales() {
  const form = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos Personales</CardTitle>
        <CardDescription>Ingresa tus datos personales para iniciar tu solicitud de admisión</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

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
                          <p className="max-w-xs">
                            Ingresa el primer nombre del aspirante
                          </p>
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
                          <p className="max-w-xs">
                            Ingresa el segundo nombre del aspirante
                          </p>
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
                          <p className="max-w-xs">
                            Ingresa el primer apellido del aspirante
                          </p>
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
                          <p className="max-w-xs">
                            Ingresa el segundo apellido del aspirante
                          </p>
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

        <FormField
          control={form.control}
          name="fecha_nacimiento"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <div className="flex items-center justify-between">
                <FormLabel>Fecha de nacimiento</FormLabel>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5">
                        <HelpCircle className="h-4 w-4" />
                        <span className="sr-only">Ayuda</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Debes tener entre 10 y 25 años para participar en el programa</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                    >
                      {field.value ? format(field.value, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <DatePicker
                    placeholder="Fecha de nacimiento"
                    width="w-[160px]"
                    disabled={(date) => date < new Date()}
                    dateFormat={(date) =>
                      date.toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })
                    }
                    onChange={(date) => {
                      field.value = date;
                    }}
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>Debes tener entre 10 y 25 años para participar</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Correo electrónico</FormLabel>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5">
                        <HelpCircle className="h-4 w-4" />
                        <span className="sr-only">Ayuda</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Recibirás notificaciones importantes en este correo</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <FormControl>
                <Input type="email" placeholder="tu.correo@ejemplo.com" {...field} />
              </FormControl>
              <FormDescription>Recibirás un correo de confirmación en esta dirección</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="telefono_estudiante"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono de contacto</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="Ej. 12345678" {...field} />
              </FormControl>
              <FormDescription>Ingresa un número de teléfono donde podamos contactarte</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}