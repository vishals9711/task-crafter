// Key for encryption, using a constant string that gets hashed
const ENCRYPTION_KEY = 'github-token-encryption-key';

// Convert string to ArrayBuffer for encryption
function str2ab(str: string) {
    const encoder = new TextEncoder();
    return encoder.encode(str);
}

// Convert ArrayBuffer to string after decryption
function ab2str(buf: ArrayBuffer) {
    const decoder = new TextDecoder();
    return decoder.decode(buf);
}

// Generate a key from our constant string
async function getKey() {
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        str2ab(ENCRYPTION_KEY),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: str2ab('github-token-salt'),
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

// Encrypt the token
export async function encryptToken(token: string): Promise<string> {
    try {
        const key = await getKey();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encryptedContent = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            str2ab(token)
        );

        // Combine IV and encrypted content
        const encryptedArray = new Uint8Array(iv.length + encryptedContent.byteLength);
        encryptedArray.set(iv);
        encryptedArray.set(new Uint8Array(encryptedContent), iv.length);

        // Convert to base64 for storage
        return btoa(String.fromCharCode(...encryptedArray));
    } catch (error) {
        console.error('Error encrypting token:', error);
        throw error;
    }
}

// Decrypt the token
export async function decryptToken(encryptedToken: string): Promise<string> {
    try {
        const key = await getKey();

        // Convert from base64
        const encryptedArray = new Uint8Array(
            atob(encryptedToken).split('').map(char => char.charCodeAt(0))
        );

        // Extract IV and encrypted content
        const iv = encryptedArray.slice(0, 12);
        const encryptedContent = encryptedArray.slice(12);

        const decryptedContent = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            encryptedContent
        );

        return ab2str(decryptedContent);
    } catch (error) {
        console.error('Error decrypting token:', error);
        throw error;
    }
} 
