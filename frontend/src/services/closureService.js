import api from './api';

export const createClosure = scope => api.post('/closures', { scope });
export const getClosures   = () => api.get('/closures');
