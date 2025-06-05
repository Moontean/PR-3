import axios from 'axios';

const API_URL = 'http://localhost:5000/api/tasks';

export const fetchTasks = () => axios.get(API_URL);
export const fetchTaskById = (id) => axios.get(`${API_URL}/${id}`);
export const createTask = (task) => axios.post(API_URL, task);
export const updateTask = (id, task) => axios.put(`${API_URL}/${id}`, task);
export const deleteTask = (id) => axios.delete(`${API_URL}/${id}`);

// Новые функции для работы с почтой
export const sendEmail = (id) => axios.post(`${API_URL}/send-email/${id}`);
export const checkEmailsIMAP = () => axios.get(`${API_URL}/check-emails-imap`);
export const checkEmailsPOP3 = () => axios.get(`${API_URL}/check-emails-pop3`);