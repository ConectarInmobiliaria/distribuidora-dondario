import api from './api';

export const getSellers = () => api.get('/sellers');
export const getSeller = id => api.get(`/sellers/${id}`);
export const createSeller = data => api.post('/sellers', data);
export const updateSeller = (id, data) => api.put(`/sellers/${id}`, data);
export const deleteSeller = id => api.delete(`/sellers/${id}`);
