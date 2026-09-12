const API_BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('elovate_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new Error('Unable to connect to the backend server. Please verify the server is running on port 5000.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

export const api = {
  auth: {
    register: (userData) => request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    login: (email, password) => request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
    me: () => request('/auth/me'),
  },
  users: {
    getAll: () => request('/users'),
  },
  teams: {
    getAll: () => request('/teams'),
    create: (teamData) => request('/teams', {
      method: 'POST',
      body: JSON.stringify(teamData),
    }),
  },
  interviews: {
    getAll: () => request('/interviews'),
    create: (intData) => request('/interviews', {
      method: 'POST',
      body: JSON.stringify(intData),
    }),
    update: (id, status) => request(`/interviews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  },
  mentorship: {
    getSessions: () => request('/mentorship/sessions'),
    bookSession: (sessionData) => request('/mentorship/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    }),
  }
};

export default api;
