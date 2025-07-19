import api from './api';

export const getDeliverers = () => api.get('/deliverers');
export const getDeliverer  = id => api.get(`/deliverers/${id}`);
export const createDeliverer = data => api.post('/deliverers', data);
export const updateDeliverer = (id, data) => api.put(`/deliverers/${id}`, data);
export const deleteDeliverer = id => api.delete(`/deliverers/${id}`);
