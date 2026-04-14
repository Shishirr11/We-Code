import React, { useEffect, useState } from "react";
<<<<<<< HEAD
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { CircularProgress } from "@mui/material";
import { validateUser } from "../api/auth";
import { setUsername } from "../store/slices/userSlice";
=======
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../config";
import { useDispatch } from "react-redux";
import { setUserName } from "../store/slices/userSlice";
import { isUsernameValid } from "../functions/authFunctions";
import { CircularProgress } from "@mui/material";
>>>>>>> 9dc63e5fe5932ea5a0688fb55425d87bac24ab60

const UsernameValidationWrapper = ({ children }) => {
  const { username } = useParams();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
<<<<<<< HEAD

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
=======
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
>>>>>>> 9dc63e5fe5932ea5a0688fb55425d87bac24ab60
};

export default UsernameValidationWrapper;
