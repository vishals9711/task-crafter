import { cookies } from 'next/headers';

export async function getCookie(name: string): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(name)?.value;
}

export async function setCookie(
    name: string,
    value: string,
    options: {
        httpOnly?: boolean;
        secure?: boolean;
        maxAge?: number;
        path?: string;
    } = {}
): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(name, value, options);
} 
