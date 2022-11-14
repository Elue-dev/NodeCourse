import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getUser } from '../../redux/authSlice';

export default function ProtectRoute({ children }) {
  const user = useSelector(getUser);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}
