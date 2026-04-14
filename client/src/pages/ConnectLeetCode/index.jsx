import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { connectLeetCode } from "../../api/auth";
import { useDispatch } from "react-redux";
import { setUsername } from "../../store/slices/userSlice";

const Step = ({ number, title, children }) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#373737] flex items-center justify-center text-sm font-semibold">
      {number}
    </div>
    <div className="flex flex-col gap-1">
      <p className="font-medium">{title}</p>
      <div className="text-sm text-gray-400">{children}</div>
    </div>
  </div>
);

const ConnectLeetCode = () => {
  const [csrfToken, setCsrfToken] = useState("");
  const [session, setSession] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleConnect = async () => {
    if (!csrfToken.trim() || !session.trim()) {
      setError("Both fields are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await connectLeetCode(csrfToken.trim(), session.trim());
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      localStorage.setItem("sessionToken", result.sessionToken);
      dispatch(setUsername(result.username));
      navigate(`/${result.username}`);
    } catch (err) {
      setError("Could not reach the server. Is it running on port 3001?");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-primary px-4">
      <div className="w-full max-w-lg flex flex-col gap-8">

        {/* Logo */}
        <div className="flex text-[42px] gap-2 font-bold self-center">
          <p>WE</p>
          <p className="px-2 text-[30px] rounded-lg bg-[#fa971f] text-black flex items-center">
            CODES
          </p>
        </div>

        {/* Instructions card */}
        <div className="bg-secondary rounded-xl p-6 flex flex-col gap-5">
          <p className="font-semibold text-base">Connect your LeetCode account</p>

          <div className="flex flex-col gap-4">
            <Step number="1" title="Go to leetcode.com and log in" />

            <Step number="2" title="Open browser DevTools">
              Press <kbd className="px-1.5 py-0.5 bg-[#3d3d3d] rounded text-xs">F12</kbd> or{" "}
              <kbd className="px-1.5 py-0.5 bg-[#3d3d3d] rounded text-xs">Cmd+Option+I</kbd>
            </Step>

            <Step number="3" title="Navigate to the cookies">
              <span>
                Go to <span className="text-white font-medium">Application</span> tab →{" "}
                <span className="text-white font-medium">Cookies</span> →{" "}
                <span className="text-white font-medium">https://leetcode.com</span>
              </span>
            </Step>

            <Step number="4" title="Copy the two cookie values below">
              Find <code className="px-1 bg-[#3d3d3d] rounded text-xs">LEETCODE_SESSION</code> and{" "}
              <code className="px-1 bg-[#3d3d3d] rounded text-xs">csrftoken</code> — they are long strings.
            </Step>
          </div>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-400">
              <code className="text-white">csrftoken</code>
            </label>
            <input
              value={csrfToken}
              onChange={(e) => setCsrfToken(e.target.value)}
              placeholder="Paste csrftoken value here"
              className="p-2.5 bg-secondary border border-[#525252] rounded-lg text-sm focus:outline-none focus:border-[#888] font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-400">
              <code className="text-white">LEETCODE_SESSION</code>
            </label>
            <textarea
              value={session}
              onChange={(e) => setSession(e.target.value)}
              placeholder="Paste LEETCODE_SESSION value here"
              rows={3}
              className="p-2.5 bg-secondary border border-[#525252] rounded-lg text-sm focus:outline-none focus:border-[#888] font-mono resize-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={handleConnect}
            className={`py-2.5 rounded-lg font-medium transition-colors ${
              loading
                ? "bg-[#464646] text-gray-500 cursor-not-allowed"
                : "bg-[#fa971f] text-black hover:bg-[#e8870e]"
            }`}
          >
            {loading ? "Connecting..." : "Connect account"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500">
          Your tokens are only stored in server memory and are never saved to disk.
        </p>
      </div>
    </div>
  );
};

export default ConnectLeetCode;