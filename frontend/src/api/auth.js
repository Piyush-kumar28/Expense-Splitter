import axiosInstance from "./axiosInstance";

export async function signup(name, email, password) {
  const response = await axiosInstance.post("/signup", {
    name,
    email,
    password,
  });
  return response.data;
}

export async function login(email, password) {
  const response = await axiosInstance.post("/login", {
    email,
    password,
  });
  return response.data;
}