import z from 'zod';
export declare const signupInput: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
}, z.z.core.$strip>;
export declare const signinInput: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, z.z.core.$strip>;
export declare const blogCreateInput: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
}, z.z.core.$strip>;
export declare const blogUpdateInput: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    published: z.ZodOptional<z.ZodBoolean>;
}, z.z.core.$strip>;
export type SignUpInput = z.infer<typeof signupInput>;
export type SignInInput = z.infer<typeof signinInput>;
export type BlogCreateInput = z.infer<typeof blogCreateInput>;
export type BlogUpdateInput = z.infer<typeof blogUpdateInput>;
//# sourceMappingURL=index.d.ts.map