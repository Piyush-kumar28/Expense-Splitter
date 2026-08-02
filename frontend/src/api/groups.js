import axiosInstance from "./axiosInstance";

export async function getMyGroups() {
  const response = await axiosInstance.get("/my-groups");
  return response.data;
}

export async function createGroup(name) {
  const response = await axiosInstance.post("/groups", { name });
  return response.data;
}

export async function addMember(groupId, email) {
  const response = await axiosInstance.post(`/groups/${groupId}/members`, {
    email,
  });
  return response.data;
}

export async function addExpense(groupId, description, amount, paidBy) {
  const response = await axiosInstance.post("/expenses", {
    groupId,
    description,
    amount,
    paidBy,
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

export async function getGroup(groupId) {
  const response = await axiosInstance.get(`/groups/${groupId}`);
  return response.data;
}

export async function getExpenses(groupId) {
  const response = await axiosInstance.get(`/groups/${groupId}/expenses`);
  return response.data;
}