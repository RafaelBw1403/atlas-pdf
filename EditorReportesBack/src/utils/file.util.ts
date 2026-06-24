import { customAlphabet } from 'nanoid';

// Removed: I, l, 1, 0, O, o (Confusing characters)
const friendlyAlphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export const generateSecureSlug = (size: number = 12): string => {
    // This is the library implementation
    const nanoid = customAlphabet(friendlyAlphabet, size);
    return nanoid();
};