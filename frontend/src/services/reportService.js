import api from './api';

export const getSalesReport      = params => api.get('/reports/sales', { params });
export const getTopProductsReport= params => api.get('/reports/products', { params });
export const getCommissionsReport= params => api.get('/reports/commissions', { params });
