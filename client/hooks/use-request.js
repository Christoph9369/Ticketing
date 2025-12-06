import axios from "axios";
import { useState } from "react";

export default function useRequest({ url, method, body, onSuccess }) {
  const [errors, setErrors] = useState(null);

  const doRequest = async (props = {}) => {
    try {
      setErrors(null);

      let response;

      if (method.toLowerCase() === "get") {
        // GET has no request body
        response = await axios.get(url, {
          params: { ...body, ...props },
        });
      } else {
        // POST, PUT, PATCH, DELETE (with body)
        response = await axios[method](url, { ...body, ...props });
      }

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;
    } catch (err) {
      const errorResponse = err?.response?.data?.errors;

      setErrors(
        <div className="alert alert-danger">
          <ul className="my-0">
            {errorResponse ? (
              errorResponse.map((error) => (
                <li key={error.message}>{error.message}</li>
              ))
            ) : (
              <li>Something went wrong</li>
            )}
          </ul>
        </div>
      );
    }
  };

  return { doRequest, errors };
}
