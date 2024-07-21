import jwtDecode from "jwt-decode";

//this service will be used to decode the token and check if it is expired before allowing users to login

export default function decodeToken(token) {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
}
