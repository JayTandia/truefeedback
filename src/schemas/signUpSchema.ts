import {z} from 'zod'

export const usernameValidation = z
        .string()
        .min(2, 'Username must be atleast 2 characters')
        .max(20, 'must not be more than 20')
        .regex(/^[a-zA-Z0-9_]+$/, 'should not contain special characters')

export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({message: 'Invalid email address'}),
    password: z.string().min(6, {message: 'atleast of 6 characters'})
})