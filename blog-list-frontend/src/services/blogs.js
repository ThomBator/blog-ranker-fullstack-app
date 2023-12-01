import axios from "axios";
const baseUrl = "/api/blog";

const getAll = async () => {
  const request = axios.get(baseUrl);
  return request.then((response) => response.data);
};

const getOne = async (id) => {
  const response = await axios.get(`${baseUrl}/${id}`);
  return response.data;
};

const addComment = async (id, comment) => {
  const response = await axios.post(`${baseUrl}/${id}/comments`, { comment });
  return response.data;
};

const create = async (newObject, token) => {
  console.log("Token in blog service", token);
  if (token) {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    const response = await axios.post(baseUrl, newObject, config);

    return response.data;
  } else {
    console.log("token not found: ", token);
  }
};

const update = async (id, newObject) => {
  const response = await axios.put(`${baseUrl}/${id}`, newObject);
  return response.data;
};

const remove = async (id) => {
  const response = await axios.delete(`${baseUrl}/${id}`);
  return response.data;
};

export default { getAll, getOne, create, update, remove, addComment };
