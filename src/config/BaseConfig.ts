
export const BASE_URL = process.env.API_BASE_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
export const BASE_USER_SERVICE = BASE_URL;
export const BASE_SOCIAL_SERVICE = BASE_URL;
export const SOCKET_URL = process.env.SOCKET_URL || process.env.REACT_APP_SOCKET_URL || 'ws://localhost:8089/ws';
export const SOCKET_SEND_MESSAGE = '/chat/send';
export const BASE_CHAT_SERVICE = BASE_URL;

