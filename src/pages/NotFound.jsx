import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* 404 Large Text */}
      <h1 className="text-9xl font-bold text-gray-700 select-none tracking-widest">
        404
      </h1>

      {/* Warning Icon & Heading */}
      <div className="flex items-center justify-center gap-3 text-2xl text-white font-bold mt-4">
        <AlertTriangle className="w-7 h-7 text-amber-500 flex-shrink-0" />
        <h2>Page Not Found</h2>
      </div>

      {/* Message */}
      <p className="text-gray-400 mt-2 max-w-md text-sm md:text-base leading-relaxed">
        The page you are looking for might have been removed or is temporarily unavailable.
      </p>

      {/* Go to Dashboard Button */}
      <button
        onClick={() => navigate("/app")}
        className="bg-emerald-600 text-white px-6 py-2 rounded-lg mt-6 hover:bg-emerald-700 font-semibold text-sm transition-colors shadow-lg shadow-emerald-600/20 cursor-pointer"
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default NotFound;
