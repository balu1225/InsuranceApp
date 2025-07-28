// services/ideonService.js
const axios = require('axios');

const ideonClient = axios.create({
  baseURL: 'https://api.ideonapi.com',
  headers: {
    'Vericred-Api-Key': process.env.IDEON_API_KEY,
    'Content-Type': 'application/json',
    'Accept-Version': 'v6'
  }
});

const createGroupOnIdeon = async (payload) => {
  const response = await ideonClient.post('/groups', payload);
  return response.data;
};

const fetchGroupFromIdeon = async (groupId) => {
  const response = await ideonClient.get(`/groups/${groupId}`);
  return response.data;
};

module.exports = {
  createGroupOnIdeon,
  fetchGroupFromIdeon
};