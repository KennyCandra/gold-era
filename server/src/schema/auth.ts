import * as z from "zod";
const userNameValidation = z.string().min(3, "minmum length for password is 8 charachters").max(16 , "maximun numbers of characters is 16");
const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .max(100, { message: 'Password cannot exceed 100 characters' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' })
  .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' });

export const loginSchema = z.object({
    body: z.object({
        email : z.email(),        
        password : passwordSchema
    })
})

export const signUpSchema = z.object({
    body: z.object({
        name: userNameValidation,
        password: passwordSchema,
        email : z.email()
    })
})