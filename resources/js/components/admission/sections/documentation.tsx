"use client"

import type React from "react"

import { useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { FileText, Upload, X, HelpCircle } from "lucide-react"

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DocumentacionProps {
  form: UseFormReturn<any>
}

export default function Documentacion({ form }: DocumentacionProps) {
  const [cedulaPreview, setCedulaPreview] = useState<string | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (file: File) => void) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      onChange(file)

      // Si es una imagen, crear preview
      if (file.type.includes("image")) {
        const reader = new FileReader()
        reader.onload = () => {
          setCedulaPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        // Si es PDF, mostrar icono
        setCedulaPreview("pdf")
      }
    }
  }

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (file: File) => void) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      onChange(file)

      const reader = new FileReader()
      reader.onload = () => {
        setFotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearCedulaFile = () => {
    form.setValue("cedulaPasaporte", undefined)
    setCedulaPreview(null)
  }

  const clearFotoFile = () => {
    form.setValue("fotoReciente", undefined)
    setFotoPreview(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentación</CardTitle>
        <CardDescription>Sube los documentos requeridos para tu solicitud</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <FormField
          control={form.control}
          name="cedulaPasaporte"
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Cédula / Pasaporte</FormLabel>
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
                        Sube una copia de tu documento de identidad en formato PDF o JPG (máx. 2MB)
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <FormControl>
                <div className="grid w-full gap-4">
                  {!cedulaPreview ? (
                    <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8">
                      <div className="flex flex-col items-center justify-center space-y-2 text-center">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Upload className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm font-medium">Arrastra o haz clic para subir</span>
                          <span className="text-xs text-muted-foreground">PDF o JPG (máx. 2MB)</span>
                        </div>
                      </div>
                      <input
                        type="file"
                        className="absolute h-full w-full cursor-pointer opacity-0"
                        accept=".pdf,.jpg,.jpeg"
                        onChange={(e) => handleCedulaChange(e, onChange)}
                        {...fieldProps}
                      />
                    </div>
                  ) : (
                    <div className="relative flex items-center justify-center rounded-md border p-4">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={clearCedulaFile}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Eliminar archivo</span>
                      </Button>
                      {cedulaPreview === "pdf" ? (
                        <div className="flex flex-col items-center space-y-2">
                          <FileText className="h-16 w-16 text-primary" />
                          <span className="text-sm font-medium">{value?.name || "Documento PDF"}</span>
                        </div>
                      ) : (
                        <img
                          src={cedulaPreview || "/placeholder.svg"}
                          alt="Vista previa del documento"
                          className="max-h-48 object-contain"
                        />
                      )}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>Sube una copia clara de tu documento de identidad</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fotoReciente"
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Foto reciente</FormLabel>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5">
                        <HelpCircle className="h-4 w-4" />
                        <span className="sr-only">Ayuda</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Sube una foto tipo carnet con fondo claro (máx. 1MB, mín. 300x300px)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <FormControl>
                <div className="grid w-full gap-4">
                  {!fotoPreview ? (
                    <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8">
                      <div className="flex flex-col items-center justify-center space-y-2 text-center">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Upload className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm font-medium">Arrastra o haz clic para subir</span>
                          <span className="text-xs text-muted-foreground">JPG o PNG (máx. 1MB)</span>
                        </div>
                      </div>
                      <input
                        type="file"
                        className="absolute h-full w-full cursor-pointer opacity-0"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => handleFotoChange(e, onChange)}
                        {...fieldProps}
                      />
                    </div>
                  ) : (
                    <div className="relative flex items-center justify-center rounded-md border p-4">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={clearFotoFile}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Eliminar archivo</span>
                      </Button>
                      <img
                        src={fotoPreview || "/placeholder.svg"}
                        alt="Vista previa de la foto"
                        className="max-h-48 object-contain"
                      />
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>Sube una foto tipo carnet con fondo claro y buena iluminación</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}