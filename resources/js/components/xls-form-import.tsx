import { useFormContext } from "react-hook-form";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";

export default function FormImportarExcel() {
    const form = useFormContext();
    return (
        <Card>
            <CardHeader>
                <CardTitle>Dirección</CardTitle>
                <CardDescription>Ingresa los datos de tu lugar de residencia actual</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Teléfono de casa */}
                <FormField
                    control={form.control}
                    name="telefono_casa"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Teléfono de casa - Opcional</FormLabel>
                            <FormControl>
                                <Input type="tel" placeholder="Ej. 12345678" {...field} />
                            </FormControl>
                            <FormDescription>
                                Ingresa un número de teléfono de casa donde podamos contactarte
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="archivo_excel"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Archivo Excel</FormLabel>
                            <FormControl>
                                <Input type="file" accept=".xls,.xlsx" onChange={(e) => field.onChange(e.target.files?.[0])} />
                            </FormControl>
                            <FormDescription>Debe contener columnas como código, nombre, departamento, etc.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Importar</Button>
            </CardContent>
        </Card>
    );
}