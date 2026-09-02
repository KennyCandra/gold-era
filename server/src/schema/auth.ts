import * as z from "zod";
const userNameValidation = z.string().min(3, "Name must be at least 3 characters").max(16 , "Name cannot exceed 16 characters");

export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' })


export const loginSchema = z.object({
    body: z.object({
        email : z.email(),
        password : z.string().min(1, "Password is required")
    })
})

export const signUpSchema = z.object({
    body: z.object({
        name: userNameValidation,
        password: passwordSchema,
        email : z.email()
    })
})

const codeSchema = z
  .string()
  .length(6, { message: 'Code must be 6 digits' })
  .regex(/^\d+$/, { message: 'Code must contain digits only' });

export const verifyEmailSchema = z.object({
    body: z.object({
        email : z.email(),
        code : codeSchema
    })
})

export const resendCodeSchema = z.object({
    body: z.object({
        email : z.email()
    })
})

export const forgotPasswordSchema = z.object({
    body: z.object({
        email : z.email()
    })
})

export const resetPasswordSchema = z.object({
    body: z.object({
        email : z.email(),
        code : codeSchema,
        password : passwordSchema
    })
})

export const changePasswordSchema = z.object({
    body: z.object({
        currentPassword : z.string().min(1, { message: 'Current password is required' }),
        newPassword : passwordSchema
    }).refine((data) => data.newPassword !== data.currentPassword, {
        message: 'New password must be different from the current password',
        path: ['newPassword']
    })
})
