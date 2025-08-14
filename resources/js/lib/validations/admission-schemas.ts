import { z } from 'zod';

// Esquemas individuales por sección
export const personalDataSchema = z.object({
    primer_nombre: z
        .string()
        .min(1, 'El primer nombre es obligatorio')
        .max(50, 'Máximo 50 caracteres')
        .regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/, {
            message: 'Solo se permiten letras, espacios, guiones y apostrofes',
        }),
    segundo_nombre: z
        .string()
        .max(50, 'Máximo 50 caracteres')
        .regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]*$/, {
            message: 'Solo se permiten letras, espacios, guiones y apostrofes',
        })
        .optional()
        .or(z.literal('')),
    primer_apellido: z
        .string()
        .min(1, 'El primer apellido es obligatorio')
        .max(50, 'Máximo 50 caracteres')
        .regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/, {
            message: 'Solo se permiten letras, espacios, guiones y apostrofes',
        }),
    segundo_apellido: z
        .string()
        .max(50, 'Máximo 50 caracteres')
        .regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]*$/, {
            message: 'Solo se permiten letras, espacios, guiones y apostrofes',
        })
        .optional()
        .or(z.literal('')),
    sexo: z.enum(['H', 'M'], {
        required_error: 'Debes seleccionar el sexo',
        invalid_type_error: 'Debes seleccionar el sexo',
    }),
    fecha_nacimiento: z.string().refine(
        (val) => {
            if (!val) return false;
            const parsed = Date.parse(val);
            if (isNaN(parsed)) return false;

            const date = new Date(parsed);
            const today = new Date();
            const age = today.getFullYear() - date.getFullYear();
            const monthDiff = today.getMonth() - date.getMonth();
            const dayDiff = today.getDate() - date.getDate();

            // Ajustar la edad si no ha pasado el cumpleaños
            const finalAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

            return finalAge >= 8 && finalAge <= 18;
        },
        { message: 'La edad debe estar entre 8 y 18 años' },
    ),
    nie: z.string().regex(/^\d{7,10}$/, {
        message: 'El NIE debe tener entre 7 y 10 dígitos',
    }),
    email: z.string().email('Ingresa un correo electrónico válido'),
});

export const responsableSchema = z.object({
    // Responsable 1 (obligatorio)
    dui_responsable_1: z.string().regex(/^\d{9}$/, {
        message: 'El DUI debe tener 9 dígitos numéricos',
    }),
    nombres_responsable_1: z
        .string()
        .min(1, 'El nombre del responsable es obligatorio')
        .max(100, 'Máximo 100 caracteres')
        .regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/, {
            message: 'Solo se permiten letras, espacios, guiones y apostrofes',
        }),
    apellidos_responsable_1: z
        .string()
        .min(1, 'El apellido del responsable es obligatorio')
        .max(100, 'Máximo 100 caracteres')
        .regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/, {
            message: 'Solo se permiten letras, espacios, guiones y apostrofes',
        }),
    email_responsable_1: z.string().email('Ingresa un correo electrónico válido').nullable().optional().or(z.literal('')),
    telefono_responsable_1: z.string().regex(/^[267]\d{7}$/, {
        message: 'El teléfono debe tener 8 dígitos y empezar con 2, 6 o 7',
    }),
    tipo_parentesco_1: z.enum(['Madre', 'Padre', 'Abuelo', 'Tio', 'Tutor legal'], {
        required_error: 'Selecciona el tipo de parentesco',
    }),

    // Responsable 2 (opcional)
    dui_responsable_2: z
        .string()
        .regex(/^\d{9}$/, {
            message: 'El DUI debe tener 9 dígitos numéricos',
        })
        .optional()
        .or(z.literal('')),
    nombres_responsable_2: z
        .string()
        .max(100, 'Máximo 100 caracteres')
        .regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]*$/, {
            message: 'Solo se permiten letras, espacios, guiones y apostrofes',
        })
        .optional()
        .or(z.literal('')),
    apellidos_responsable_2: z
        .string()
        .max(100, 'Máximo 100 caracteres')
        .regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]*$/, {
            message: 'Solo se permiten letras, espacios, guiones y apostrofes',
        })
        .optional()
        .or(z.literal('')),
    email_responsable_2: z.string().email('Ingresa un correo electrónico válido').nullable().optional().or(z.literal('')),
    telefono_responsable_2: z
        .string()
        .regex(/^[267]\d{7}$/, {
            message: 'El teléfono debe tener 8 dígitos y empezar con 2, 6 o 7',
        })
        .optional()
        .or(z.literal('')),
    tipo_parentesco_2: z.enum(['Madre', 'Padre', 'Abuelo', 'Tio', 'Tutor legal']).optional(),
});

export const addressSchema = z.object({
    telefono_casa: z
        .string()
        .regex(/^[267]\d{7}$/, {
            message: 'El teléfono debe tener 8 dígitos y empezar con 2, 6 o 7',
        })
        .nullable()
        .optional()
        .or(z.literal('')),
    direccion: z.string().min(5, 'La dirección debe tener al menos 5 caracteres').max(255, 'Máximo 255 caracteres'),
    distrito: z.string().regex(/^\d+$/, {
        message: 'Debes seleccionar un distrito',
    }),
    departamento: z.string().min(1, {
        message: 'Debes seleccionar un departamento',
    }),
    municipio: z.string().min(1, {
        message: 'Debes seleccionar un municipio',
    }),
});

export const educationSchema = z.object({
    centro_educativo: z
        .string()
        .min(5, { message: 'El nombre debe tener al menos 5 caracteres' })
        .max(100, 'Máximo 100 caracteres')
        .regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ0-9"'\s\-.]+$/, {
            message: 'Formato de nombre inválido',
        }),
    sector: z.enum(['PÚBLICO', 'PRIVADO'], {
        required_error: 'Selecciona el sector',
    }),
    zona: z.enum(['Rural', 'Urbana'], {
        required_error: 'Selecciona la zona',
    }),
    internacional: z.enum(['SI', 'NO'], {
        required_error: 'Selecciona si el centro es internacional',
    }),
    nivel_educativo: z.enum(['n0', 'n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7'], {
        required_error: 'Selecciona tu nivel de estudios',
    }),
});

// Esquema completo que combina todos los esquemas individuales
export const fullFormSchema = personalDataSchema.and(responsableSchema).and(addressSchema).and(educationSchema);

// Función helper para validar una sección específica
export function validateSection(sectionName: string, data: Record<string, unknown>) {
    switch (sectionName) {
        case 'datos-personales':
            return personalDataSchema.safeParse(data);
        case 'datos-responsables':
            return responsableSchema.safeParse(data);
        case 'direccion':
            return addressSchema.safeParse(data);
        case 'educacion':
            return educationSchema.safeParse(data);
        default:
            return { success: false, error: { issues: [] } };
    }
}

// Función helper para obtener errores por sección
export function getErrorsBySection(errors: Record<string, unknown>) {
    const personalDataFields = ['primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'sexo', 'fecha_nacimiento', 'nie', 'email'];
    const responsableFields = [
        'dui_responsable_1',
        'nombres_responsable_1',
        'apellidos_responsable_1',
        'telefono_responsable_1',
        'tipo_parentesco_1',
        'dui_responsable_2',
        'nombres_responsable_2',
        'apellidos_responsable_2',
        'telefono_responsable_2',
        'tipo_parentesco_2',
    ];
    const addressFields = ['direccion', 'distrito', 'departamento', 'municipio', 'telefono_casa'];
    const educationFields = ['centro_educativo', 'nivel_educativo', 'sector', 'zona', 'internacional'];

    return {
        'datos-personales': Object.keys(errors).filter((key) => personalDataFields.includes(key)).length,
        'datos-responsables': Object.keys(errors).filter((key) => responsableFields.includes(key)).length,
        direccion: Object.keys(errors).filter((key) => addressFields.includes(key)).length,
        educacion: Object.keys(errors).filter((key) => educationFields.includes(key)).length,
        resumen: 0,
    };
}
