import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BeatLoader } from 'react-spinners';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { RiLockPasswordLine } from 'react-icons/ri';
import { MdOutlineMail } from 'react-icons/md';
import axios from 'axios';
import './auth.scss';
import { useDispatch } from 'react-redux';
import { SET_ACTIVE_USER } from '../../redux/authSlice';
import { showAlert } from '../../utils/Alert';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const passwordRef = useRef();
  const emailRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    emailRef.current.focus();
  }, []);

  const handleUserSignIn = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    const userData = {
      email,
      password,
    };

    try {
      setLoading(true);
      const response = await axios.post('api/v1/users/login', userData);

      if (response?.data.status === 'success') {
        dispatch(SET_ACTIVE_USER(response?.data.data.user));

        localStorage.setItem('token', JSON.stringify(response?.data.token));
        showAlert(
          'success',
          `Logged in successfully, ${
            response.data.data.user.name.split(' ')[1]
          }!`
        );
        // setMessage('Login Successful!. Redirecting to Dashboard...');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
      setLoading(false);
    } catch (error) {
      showAlert('error', error.response?.data.message);
      setLoading(false);
    }
  };

  return (
    <main className="main">
      <div className="login-form">
        <h2 className="heading-secondary ma-bt-lg">Log into your account</h2>
        {error && <h2>{error}</h2>}
        {message && <h2>{message}</h2>}
        <form className="form form--login" onSubmit={handleUserSignIn}>
          <div className="form-group ma-bt-md">
            <label htmlFor="password" className="form__label">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              ref={emailRef}
              onChange={(e) => setEmail(e.target.value)}
              className="form__input"
              required
              placeholder="you@example.com"
            />
          </div>
          <div className="form__group ma-bt-md">
            <label htmlFor="password" className="form__label">
              Password
            </label>
            <input
              type="password"
              className="form__input"
              value={password}
              ref={passwordRef}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength="8"
            />
          </div>
          <div className="form__group">
            {loading ? (
              <button className="btn btn--green" type="button" disabled>
                <BeatLoader loading={loading} size={10} color={'#fff'} />
              </button>
            ) : (
              <button className="btn btn--green" type="submit">
                Login
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
