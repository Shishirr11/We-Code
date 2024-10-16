import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setUserName } from "../../store/slices/userSlice";
import { BACKEND_URL } from "../../config";
import { useNavigate } from "react-router-dom";
import Button from "@girishsawant999/react-loading-button";
import { isUsernameValid } from "../../functions/authFunctions";

const LandingPage = () => {
  const [username, setUserNameLocal] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const usernameLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const usernameValidity = await isUsernameValid(username);
    if (!usernameValidity) {
      alert("invalid username or session expired, please use extension to login");
    } else {
      if (username !== "") dispatch(setUserName(username));
      navigate(`/${username}`);
    }
    setLoading(false);
  };

  return (
    <div className="landing-page flex flex-col items-center gap-20 w-[80%] lg:w-[70%] xl:w-[60%] pb-[15%]">
      <div
        className="logo flex text-[50px] gap-2 font-bold"
        style={{ fontFamily: "arial" }}
      >
        <p className="pr-0">WE</p>
        <p className="px-2 text-[35px] rounded-lg bg-[#fa971f] text-black flex items-center justify-center">
          CODES
        </p>
      </div>

      <form className="username-login flex flex-col gap-2 w-[25%] max-w-[300px] min-w-[200px]">
        <h1 className="font-bold text-2xl mx-auto">Enter Your username</h1>
        <label className="username-label flex flex-col gap-2 py-1">
          <p>username</p>
          <input
            value={username}
            onChange={(e) => setUserNameLocal(e.target.value)}
            className="p-2 bg-primary border-[1px] rounded-md border-[#525252]"
          />
        </label>
        <button
          type="submit"
          onClick={(e) => usernameLogin(e)}
          className={
            "mx-auto w-[80%] py-2 hover:bg-[#464646] rounded-[8px] bg-tertiary active:bg-tertiary " +
            (loading && "opacity-10 active:bg-inherit")
          }
          disabled={loading}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default LandingPage;
