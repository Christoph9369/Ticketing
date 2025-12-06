import axios from "axios";

export default ({ req }) => {
  // ----------------------------------------------------------
  // 1. CHECK IF WE ARE ON THE SERVER OR IN THE BROWSER
  // ----------------------------------------------------------
  // Next.js sets "window" ONLY in the browser.
  // During SSR (getInitialProps executed on the server),
  // "window" is undefined.
  // ----------------------------------------------------------
  if (typeof window === "undefined") {
    // --------------------------------------------------------
    // ➤ We are executing getInitialProps on the SERVER (inside a pod)
    // --------------------------------------------------------
    // This means the request comes from Kubernetes, not the browser.
    // Kubernetes must call the ingress controller directly using
    // the internal cluster DNS name.
    //
    // IMPORTANT:
    //  - We DO NOT use ticketing.dev here (that works only in browser)
    //  - We DO call ingress-nginx-controller service directly
    // --------------------------------------------------------
    return axios.create({
      // Internal ingress controller address for SSR inside the cluster
      baseURL:
        "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",

      // Forward all incoming request headers (cookies especially)
      // req.headers.cookie contains the session JWT
      headers: req ? req.headers : {},
    });
  }

  // ----------------------------------------------------------
  // 2. WE ARE IN THE BROWSER (window exists)
  // ----------------------------------------------------------
  // Browser calls must use relative URLs.
  // That means requests go to:
  //     http://ticketing.dev/api/...
  // because the browser automatically uses the domain in the address bar.
  // ----------------------------------------------------------
  return axios.create({
    baseURL: "/", // Browser → "http://ticketing.dev/"
  });
};
