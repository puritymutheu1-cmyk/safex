import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="mt-2">That page does not exist.</p>
      <Link to="/" className="mt-4 text-blue-600 underline">
        Go home
      </Link>
    </div>
  );
}
