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

// ✅ Group APIs
const createGroupOnIdeon = async (payload) => {
  const response = await ideonClient.post('/groups', payload);
  return response.data;
};

const fetchGroupFromIdeon = async (groupId) => {
  const response = await ideonClient.get(`/groups/${groupId}`);
  return response.data;
};

// ✅ Member APIs
const createMembers = async (groupId, members) => {
  const response = await ideonClient.post(`/groups/${groupId}/members`, {
    members
  });
  return response.data;
};

const replaceMembersInGroup = async (groupId, members) => {
  const response = await ideonClient.put(`/groups/${groupId}/members`, {
    members
  });
  return response.data;
};

const deleteMembersFromGroup = async (groupId) => {
  const response = await ideonClient.delete(`/groups/${groupId}/members`);
  return response.data;
};

// ✅ ICHRA Affordability APIs
const createAffordabilityCalculation = async (groupId, payload) => {
  const response = await ideonClient.post(`/groups/${groupId}/ichra_affordability_calculations`, payload);
  return response.data;
};

const getAffordabilityStatus = async (calculationId) => {
  const response = await ideonClient.get(`/ichra_affordability_calculations/${calculationId}`);
  return response.data;
};

const getAffordabilityMembers = async (calculationId) => {
  const response = await ideonClient.get(`/ichra_affordability_calculations/${calculationId}/members`);
  return response.data;
};

module.exports = {
  createGroupOnIdeon,
  fetchGroupFromIdeon,
  createMembers,
  replaceMembersInGroup,
  deleteMembersFromGroup,
  createAffordabilityCalculation,
  getAffordabilityStatus,
  getAffordabilityMembers
};
