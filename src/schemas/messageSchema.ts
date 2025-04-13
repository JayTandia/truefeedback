import {z} from 'zod'

export const messageSchema = z.object({
    content: z.string().min(10, {message: 'minimum 10 charcters'}).max(300, {message: 'maximum 10 charcters'})
})