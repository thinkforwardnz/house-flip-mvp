import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-blue flex flex-col justify-center p-4">
      {/* Page Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-lg text-blue-100">The page you're looking for doesn't exist</p>
      </div>

      <div className="flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-4xl font-bold mb-4 text-navy-dark">404</h2>
          <p className="text-xl text-navy mb-4">Oops! Page not found</p>
          <Link to="/" className="text-blue-primary hover:text-blue-600 underline">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
