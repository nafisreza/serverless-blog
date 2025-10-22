import z from 'zod';
export const signupInput = z.object({
    username: z.string().min(3),
    password: z.string().min(6),
    name: z.string().optional(),
});
export const signinInput = z.object({
    username: z.string().min(3),
    password: z.string().min(6),
});
export const blogCreateInput = z.object({
    title: z.string(),
    content: z.string(),
});
export const blogUpdateInput = z.object({
    title: z.string(),
    content: z.string(),
    published: z.boolean(),
}).partial();
//# sourceMappingURL=index.js.map