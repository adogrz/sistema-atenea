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
        .min(1, 'El segundo nombre es obligatorio')
        .max(50, 'Máximo 50 caracteres')
        .regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/, {
            message: 'Solo se permiten letras, espacios, guiones y apostrofes',
        }),
    primer_apellido: z
        .string()
        .min(1, 'El primer apellido es obligatorio')
        .max(50, 'Máximo 50 caracteres')
        .regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/, {
            message: 'Solo se permiten letras, espacios, guiones y apostrofes',
        }),
    segundo_apellido: z
        .string()
        .min(1, 'El segundo apellido es obligatorio')
        .max(50, 'Máximo 50 caracteres')
        .regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/, {
            message: 'Solo se permiten letras, espacios, guiones y apostrofes',
        }),
    sexo: z
        .string({
            required_error: 'Selecciona el sexo del aspirante',
        })
        .min(1, 'Selecciona el sexo del aspirante')
        .refine((val) => ['H', 'M'].includes(val), {
            message: 'Selecciona el sexo del aspirante',
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

            return finalAge >= 6 && finalAge <= 20;
        },
        { message: 'La edad debe estar entre 6 y 20 años' },
    ),
    nie: z.string().regex(/^\d{7,10}$/, {
        message: 'El NIE debe tener entre 7 y 10 dígitos',
    }),
    telefono_estudiante: z
        .string()
        .optional()
        .refine(
            (val) => {
                if (!val || val.trim() === '') return true; // Permite que el campo sea opcional
                return /^[267]\d{7}$/.test(val);
            },
            {
                message: 'El teléfono debe tener 8 dígitos y empezar con 2, 6 o 7',
            },
        ),
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
    tipo_parentesco_1: z
        .string({
            required_error: 'Selecciona el tipo de parentesco',
            invalid_type_error: 'Selecciona el tipo de parentesco',
        })
        .min(1, 'Selecciona el tipo de parentesco')
        .refine((val) => ['Madre', 'Padre', 'Abuelo', 'Tio', 'Tutor legal', 'Otro'].includes(val), {
            message: 'Selecciona el tipo de parentesco',
        }),
    otro_parentesco_1: z
        .string()
        .max(50, 'Máximo 50 caracteres')
        .optional()
        .or(z.literal('')),

    // Responsable 2 (opcional)
    dui_responsable_2: z
        .string()
        .optional()
        .or(z.literal('')),
    nombres_responsable_2: z
        .string()
        .optional()
        .or(z.literal('')),
    apellidos_responsable_2: z
        .string()
        .optional()
        .or(z.literal('')),
    email_responsable_2: z
        .string()
        .optional()
        .or(z.literal('')),
    telefono_responsable_2: z
        .string()
        .optional()
        .or(z.literal('')),
    tipo_parentesco_2: z
        .string()
        .refine((val) => val === '' || ['Madre', 'Padre', 'Abuelo', 'Tio', 'Tutor legal', 'Otro'].includes(val), {
            message: 'Selecciona el tipo de parentesco',
        })
        .optional()
        .or(z.literal('')),
    otro_parentesco_2: z
        .string()
        .optional()
        .or(z.literal('')),
}).superRefine((data, ctx) => {
    // Validar que si tipo_parentesco_1 es "Otro", entonces otro_parentesco_1 es requerido
    if (data.tipo_parentesco_1 === 'Otro' && (!data.otro_parentesco_1 || data.otro_parentesco_1.trim() === '')) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Especifica el tipo de parentesco cuando seleccionas "Otro"',
            path: ['otro_parentesco_1'],
        });
    }

    // Validar que si tipo_parentesco_2 es "Otro", entonces otro_parentesco_2 es requerido
    if (data.tipo_parentesco_2 === 'Otro' && (!data.otro_parentesco_2 || data.otro_parentesco_2.trim() === '')) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Especifica el tipo de parentesco cuando seleccionas "Otro"',
            path: ['otro_parentesco_2'],
        });
    }

    // Verificar si hay algún dato del responsable 2
    const hasAnySecondResponsableData =
        (data.dui_responsable_2 && data.dui_responsable_2.trim() !== '') ||
        (data.nombres_responsable_2 && data.nombres_responsable_2.trim() !== '') ||
        (data.apellidos_responsable_2 && data.apellidos_responsable_2.trim() !== '') ||
        (data.telefono_responsable_2 && data.telefono_responsable_2.trim() !== '') ||
        (data.tipo_parentesco_2 && data.tipo_parentesco_2.trim() !== '');

    // Si hay algún dato del responsable 2, validar todos los campos requeridos
    if (hasAnySecondResponsableData) {
        // Validar DUI del responsable 2
        if (!data.dui_responsable_2 || data.dui_responsable_2.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'El DUI del responsable 2 es requerido',
                path: ['dui_responsable_2'],
            });
        } else if (!/^\d{9}$/.test(data.dui_responsable_2)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'El DUI debe tener 9 dígitos numéricos',
                path: ['dui_responsable_2'],
            });
        }

        // Validar nombres del responsable 2
        if (!data.nombres_responsable_2 || data.nombres_responsable_2.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Los nombres del responsable 2 son requeridos',
                path: ['nombres_responsable_2'],
            });
        } else if (data.nombres_responsable_2.length > 100) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Máximo 100 caracteres',
                path: ['nombres_responsable_2'],
            });
        } else if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/.test(data.nombres_responsable_2)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Solo se permiten letras, espacios, guiones y apostrofes',
                path: ['nombres_responsable_2'],
            });
        }

        // Validar apellidos del responsable 2
        if (!data.apellidos_responsable_2 || data.apellidos_responsable_2.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Los apellidos del responsable 2 son requeridos',
                path: ['apellidos_responsable_2'],
            });
        } else if (data.apellidos_responsable_2.length > 100) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Máximo 100 caracteres',
                path: ['apellidos_responsable_2'],
            });
        } else if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/.test(data.apellidos_responsable_2)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Solo se permiten letras, espacios, guiones y apostrofes',
                path: ['apellidos_responsable_2'],
            });
        }

        // Validar teléfono del responsable 2
        if (!data.telefono_responsable_2 || data.telefono_responsable_2.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'El teléfono del responsable 2 es requerido',
                path: ['telefono_responsable_2'],
            });
        } else if (!/^[267]\d{7}$/.test(data.telefono_responsable_2)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'El teléfono debe tener 8 dígitos y empezar con 2, 6 o 7',
                path: ['telefono_responsable_2'],
            });
        }

        // Validar parentesco del responsable 2
        if (!data.tipo_parentesco_2 || data.tipo_parentesco_2.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'El tipo de parentesco del responsable 2 es requerido',
                path: ['tipo_parentesco_2'],
            });
        }

        // Validar email si se proporciona
        if (data.email_responsable_2 && data.email_responsable_2.trim() !== '') {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email_responsable_2)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'El formato del email no es válido',
                    path: ['email_responsable_2'],
                });
            }
        }
    }
});

export const addressSchema = z.object({
    telefono_casa: z
        .string()
        .optional()
        .refine(
            (val) => {
                if (!val || val.trim() === '') return true; // Permite que el campo sea opcional
                return /^[267]\d{7}$/.test(val);
            },
            {
                message: 'El teléfono debe tener 8 dígitos y empezar con 2, 6 o 7',
            },
        ),
    colonia: z
        .string()
        .min(3, 'La colonia debe tener al menos 3 caracteres')
        .max(100, 'Máximo 100 caracteres'),
    calle: z
        .string()
        .min(3, 'La calle debe tener al menos 3 caracteres')
        .max(100, 'Máximo 100 caracteres'),
    numero_casa: z
        .string()
        .min(1, 'El número de casa es obligatorio')
        .max(20, 'Máximo 20 caracteres'),
    punto_referencia: z
        .string()
        .max(150, 'Máximo 150 caracteres')
        .optional()
        .or(z.literal('')),
    direccion: z
        .string()
        .max(255, 'Máximo 255 caracteres')
        .optional()
        .or(z.literal('')),
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
        .min(1, { message: 'Debes seleccionar un centro educativo' })
        .max(100, 'Máximo 100 caracteres'),
    centro_nombre: z
        .string()
        .optional(), // Solo para mostrar en UI, no se envía al backend
    sector: z
        .string()
        .optional()
        .refine((val) => !val || val === '' || ['PÚBLICO', 'PRIVADO'].includes(val), {
            message: 'Sector debe ser PÚBLICO o PRIVADO',
        }),
    zona: z
        .string()
        .optional()
        .refine((val) => !val || val === '' || ['Rural', 'Urbana'].includes(val), {
            message: 'Zona debe ser Rural o Urbana',
        }),
    internacional: z
        .string()
        .optional()
        .refine((val) => !val || val === '' || ['SI', 'NO'].includes(val), {
            message: 'Internacional debe ser SI o NO',
        }),
    nivel_educativo: z
        .number({
            required_error: 'Selecciona el nivel de estudios del aspirante',
            invalid_type_error: 'Selecciona el nivel de estudios del aspirante',
        })
        .int('Debe ser un número entero')
        .min(0, 'Nivel educativo no válido')
        .max(8, 'Nivel educativo no válido')
        .optional()
        .refine((val) => val !== undefined && val >= 0, { message: 'Selecciona el nivel de estudios del aspirante' }),
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
    const personalDataFields = ['primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'sexo', 'fecha_nacimiento', 'nie', 'telefono_estudiante', 'email'];
    const responsableFields = [
        'dui_responsable_1',
        'nombres_responsable_1',
        'apellidos_responsable_1',
        'email_responsable_1',
        'telefono_responsable_1',
        'tipo_parentesco_1',
        'otro_parentesco_1',
        'dui_responsable_2',
        'nombres_responsable_2',
        'apellidos_responsable_2',
        'email_responsable_2',
        'telefono_responsable_2',
        'tipo_parentesco_2',
        'otro_parentesco_2',
    ];
    const addressFields = ['telefono_casa', 'colonia', 'calle', 'numero_casa', 'punto_referencia', 'direccion', 'distrito', 'departamento', 'municipio'];
    const educationFields = ['centro_educativo', 'nivel_educativo', 'sector', 'zona', 'internacional'];

    return {
        'datos-personales': Object.keys(errors).filter((key) => personalDataFields.includes(key)).length,
        'datos-responsables': Object.keys(errors).filter((key) => responsableFields.includes(key)).length,
        direccion: Object.keys(errors).filter((key) => addressFields.includes(key)).length,
        educacion: Object.keys(errors).filter((key) => educationFields.includes(key)).length,
        resumen: 0,
    };
}
