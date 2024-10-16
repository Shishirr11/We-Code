import React from "react";
import { useParams, Navigate } from "react-router-dom";
const RedirectFromExtension = () => {
  const { username, sessionToken } = useParams();
  localStorage.setItem("sessionToken", sessionToken);
  return <Navigate to={`/${username}`} />;
};

export default RedirectFromExtension;
