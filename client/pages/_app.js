// pages/_app.js
import "bootstrap/dist/css/bootstrap.css";
import buildClient from "../api/build-client";
import Header from "../components/header";

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />

      <Component {...pageProps} currentUser={currentUser} />
    </div>
  );
};

AppComponent.getInitialProps = async (appContext) => {
  // Build SSR-aware Axios client
  const client = buildClient(appContext.ctx);

  // Fetch logged-in user once (for every page)
  const { data } = await client.get("/api/users/currentuser");

  // Get child page's getInitialProps if it exists
  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(appContext.ctx);
  }

  // Pass result to component
  return {
    pageProps,
    currentUser: data.currentUser,
  };
};

export default AppComponent;
