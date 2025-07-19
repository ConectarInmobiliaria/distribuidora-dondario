import api from './api';

export const getSales   = () => api.get('/sales');
export const getSale    = id => api.get(`/sales/${id}`);
export const createSale = data => api.post('/sales', data);
export const deleteSale = id => api.delete(`/sales/${id}`);
export const returnSaleItem = (itemId, returnedQty) =>
  api.post(`/sales/items/${itemId}/return`, { returnedQty });