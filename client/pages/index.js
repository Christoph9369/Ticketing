// pages/index.js
import buildClient from "../api/build-client";

const LandingPage = ({ currentUser }) => {
  console.log("Current user:", currentUser);

  // Show UI based on authentication
  return currentUser ? (
    <h1>You are signed in</h1>
  ) : (
    <h1>You are not signed in</h1>
  );
};

LandingPage.getInitialProps = async (context) => {
  // Create axios instance that knows whether SSR or browser
  const client = buildClient(context);

  // Call current user endpoint
  const { data } = await client.get("/api/users/currentuser");

  // Return as props to component
  return data; // e.g. { currentUser: {...} }
};

export default LandingPage;
