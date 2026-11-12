import { Link, useNavigate, useLocation } from "react-router-dom";

export default function AuthLinks() {
  const navigate = useNavigate();
  useLocation(); // re-checks login state on every page change
  const loggedIn = !!localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loggedIn) {
    return (
      <>
        <Link to="/dashboard">Dashboard</Link>
        <button onClick={logout}>Log out</button>
      </>
    );
  }
  return (
    <>
      <Link to="/login">Log in</Link>
      <Link to="/register">Sign up</Link>
    </>
  );
}
