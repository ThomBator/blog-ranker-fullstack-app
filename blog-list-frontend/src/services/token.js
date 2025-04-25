import { jwtDecode } from "jwt-decode";

//this service will be used to decode the token and check if it is expired before allowing users
//found the jwt-decode library to get the expiry date from the token and see if it is still valid without having to check with the server
const decodeToken = (token) => {
  // Handle null/undefined token explicitly
  if (!token) {
    return null;
  }
  try {
    return jwtDecode(token);
  } catch (error) {
    // Don't log error here in tests, just return null for invalid format
    // console.error("Invalid token", error);
    return null;
  }
};

const checkIfTokenIsExpired = (token) => {
  const decodedToken = decodeToken(token);
  if (!decodedToken || !decodedToken.exp) {
    // If no token, invalid token, or no expiration, treat as expired/invalid
    return true;
  }

  const currentTime = Date.now() / 1000;

  return decodedToken.exp < currentTime;
};

export { decodeToken, checkIfTokenIsExpired };
