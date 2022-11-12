import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BeatLoader } from 'react-spinners';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { RiLockPasswordLine } from 'react-icons/ri';
import { MdOutlineMail } from 'react-icons/md';
import axios from 'axios';
import './auth.scss';
import { useDispatch, useSelector } from 'react-redux';
import { getUser, SET_ACTIVE_USER } from '../../redux/authSlice';

export default function SignUp() {
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
  const user = useSelector(getUser);

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

      console.log(response);

      if (response?.data.status === 'success') {
        dispatch(SET_ACTIVE_USER(response?.data.data.user));

        console.log(response.data.data.user);
        localStorage.setItem('token', JSON.stringify(response?.data.token));
        setMessage('Login Successful!. Redirecting to Dashboard...');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setError(error.response?.data.message);
      setLoading(false);
    }
  };

  // const verifyEmail = () => {
  //   try {
  //     console.log(user);
  //     const response = axios.get(
  //       `api/auth/send-verification-token/${user._id}`
  //     );
  //     console.log(response.data);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const handlePasswordVisibility = () => {
    setVisible(!visible);
    if (passwordRef.current.type === 'password') {
      passwordRef.current.setAttribute('type', 'text');
    } else {
      passwordRef.current.setAttribute('type', 'password');
    }
  };

  return (
    <main>
      <div className="auth">
        <div className="auth__contents">
          <h2>Log in</h2>
          <form onSubmit={handleUserSignIn}>
            {error && <p className="error__message">{error}</p>}
            {message && <p className="message">{message}</p>}
            <label>
              <span>Email:</span>
              <div className="auth__icon">
                <MdOutlineMail />
                <input
                  type="email"
                  value={email}
                  ref={emailRef}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
            </label>
            <br />
            <label>
              <span>Password:</span>
              <div className="password__visibility__toggler">
                <RiLockPasswordLine />
                <input
                  type="password"
                  value={password}
                  ref={passwordRef}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />
                <span onClick={handlePasswordVisibility}>
                  {visible ? (
                    <AiOutlineEye size={20} />
                  ) : (
                    <AiOutlineEyeInvisible size={20} />
                  )}
                </span>
              </div>
            </label>
            <br />
            <div>
              <Link to="/forgot-password" className="f__password">
                <p>Forgot Password?</p>
              </Link>

              <Link to="/verify-email">Verify your email</Link>
            </div>

            {loading ? (
              <button type="button" disabled>
                <BeatLoader loading={loading} size={10} color={'#fff'} />
              </button>
            ) : (
              <button type="submit">Continue</button>
            )}
            <div className="account">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
