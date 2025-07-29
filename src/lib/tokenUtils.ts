import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  id: string;
  email: string;
  role: string;
  role_id: number;
  iat: number;
  exp: number;
  jti: string;
}

export const isTokenValid = (token: string): boolean => {
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
};

export const isTokenExpiringSoon = (token: string, thresholdMinutes: number = 30): boolean => {
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    const thresholdSeconds = thresholdMinutes * 60;
    return decoded.exp - currentTime < thresholdSeconds;
  } catch (error) {
    return true; // If we can't decode, assume it's expiring
  }
};

export const getTokenExpirationTime = (token: string): Date | null => {
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

export const clearInvalidToken = (): void => {
  localStorage.removeItem('token');
}; 