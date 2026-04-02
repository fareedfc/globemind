/**
 * Tiny singleton that holds the current authenticated user ID.
 * Stores read from this instead of importing authStore (which would create cycles).
 * authStore sets it on login/logout/initSession.
 */

let _userId: string | null = null;

export const getCurrentUserId = (): string | null => _userId;
export const setCurrentUserId = (id: string | null): void => { _userId = id; };
