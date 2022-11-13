import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getUser } from '../../redux/authSlice';
import { showAlert } from '../../utils/Alert';

export default function ProtectRoute({ children }) {
  const user = useSelector(getUser);

  if (!user) {
    showAlert('error', `You must login to gain access to that page`);
    return <Navigate to="/login" />;
  }

  return children;
}
