import { useRouteError } from 'react-router-dom';
import { Link } from 'react-router-dom';

const ErrorBoundary = () => {
  const error = useRouteError();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Oops!</h1>
        <p className="text-xl text-gray-700 mb-4">
          {error?.statusText || error?.message || 'Something went wrong'}
        </p>
        <p className="text-gray-600 mb-8">
          {error?.status === 404 
            ? "The page you're looking for doesn't exist."
            : "We're sorry, but there was an error loading this page."}
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default ErrorBoundary; 