import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { CircularProgress } from "@mui/material";
import { validateUser } from "../api/auth";
import { setUsername } from "../store/slices/userSlice";

const UsernameValidationWrapper = ({ children }) => {
  const { username } = useParams();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const validate = async () => {
      const sessionToken = localStorage.getItem("sessionToken");
      const valid = await validateUser(username, sessionToken);
      if (valid) {
        dispatch(setUsername(username));
        setLoading(false);
      } else {
        navigate("/connect");
      }
    };
    validate();
  }, [username]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <CircularProgress color="inherit" />
      </div>
    );
  }

  return children;
};

export default UsernameValidationWrapper;