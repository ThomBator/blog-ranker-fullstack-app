import { jwtDecode } from "jwt-decode";

//this service will be used to decode the token and check if it is expired before allowing users
//found the jwt-decode library to get the expiry date from the token and see if it is still valid without having to check with the server
const decodeToken = (token) => {
  console.log("token at decodeToken: ", token);

  console.log("typeof token at decodeToken: ", typeof token);
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
};

const checkIfTokenIsExpired = (token) => {
  const decodedToken = decodeToken(token);

  if (!decodedToken) {
    return true;
  }

  console.log("Token Expirey Time: ", decodeToken.exp);

  const currentTime = Date.now() / 1000;
  console.log("Current time ", currentTime);
  return decodedToken.exp < currentTime;
};

export default checkIfTokenIsExpired;
