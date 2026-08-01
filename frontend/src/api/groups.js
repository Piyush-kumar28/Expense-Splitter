import axiosInstance from "./axiosInstance";

export async function createGroup(name) {
  const response = await axiosInstance.post("/groups", { name });
  return response.data;
}

export async function addMember(groupId, userId) {
  const response = await axiosInstance.post(`/groups/${groupId}/members`, {
    userId,
  });
  return response.data;
}

export async function addExpense(groupId, description, amount) {
  const response = await axiosInstance.post("/expenses", {
    groupId,
    description,
    amount,
  });
  return response.data;
}

export async function getBalances(groupId) {
  const response = await axiosInstance.get(`/groups/${groupId}/balances`);
  return response.data;
}

export async function getSettlements(groupId) {
  const response = await axiosInstance.get(`/groups/${groupId}/settlements`);
  return response.data;
}