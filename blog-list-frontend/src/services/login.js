import axios from "axios";
const baseURL = "/api/login";

const login = async (credentials) => {
  const response = await axios.post(baseURL, credentials);
  console.log("Login Response ", response.data);
  return response.data;
};

export default { login };
