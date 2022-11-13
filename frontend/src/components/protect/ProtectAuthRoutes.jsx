const { useSelector } = require('react-redux');
const { Navigate } = require('react-router-dom');
const { getUser } = require('../../redux/authSlice');

export default function ProtectAuthRoutes({ children }) {
  const user = useSelector(getUser);

  if (user) {
    return <Navigate to="/" />;
  }

  return children;
}
