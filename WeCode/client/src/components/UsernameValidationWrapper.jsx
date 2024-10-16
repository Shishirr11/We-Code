import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../config";
import { useDispatch } from "react-redux";
import { setUserName } from "../store/slices/userSlice";
import { isUsernameValid } from "../functions/authFunctions";
import { CircularProgress } from "@mui/material";

const UsernameValidationWrapper = ({ children }) => {
  const { username } = useParams();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const validateUsername = async () => {
    const usernameValidity = await isUsernameValid(username);
    if (usernameValidity) {
      dispatch(setUserName(username));
      setLoading(false);
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    validateUsername();
  }, []);

  return loading ? <CircularProgress color="inherit" /> : children;
};

export default UsernameValidationWrapper;
