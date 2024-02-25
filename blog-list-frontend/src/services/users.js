import axios from "axios";
const baseUrl = "/api/users";

const getAll = () => {
  const request = axios.get(baseUrl);
  return request.then((response) => response.data);
};

const getOne = async (id) => {
  const response = await axios.get(`${baseUrl}/${id}`);
  return response.data;
};

const signUp = async (credentials) => {
  const response = await axios.post(`${baseUrl}`, credentials);
  return response.data;
};

export default { getAll, getOne, signUp };
