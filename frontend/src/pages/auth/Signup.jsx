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

const initialState = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function Signup() {
  const [values, setValues] = useState(initialState);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const handleUserSignIn = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    const userData = {
      name: values.username,
      email: values.email,
      password: values.password,
      passwordConfirm: values.confirmPassword,
    };

    try {
      setLoading(true);
      const response = await axios.post(
        'http://localhost:5000/api/v1/users/signup',
        userData
      );
      if (response?.data.status === 'success') {
        dispatch(SET_ACTIVE_USER(response?.data.data.user));
        setValues(initialState);

        console.log(response.data.data.user);
        localStorage.setItem('token', JSON.stringify(response?.data.token));
        showAlert('success', 'Login Successful!. Redirecting to Dashboard...');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      showAlert('error', error.response?.data.message);
      setLoading(false);
    }
  };

  return (
    <main className="main">
      <div className="login-form">
        <h2 className="heading-secondary ma-bt-lg">Sign up to natours</h2>
        {error && <h2>{error}</h2>}
        {message && <h2>{message}</h2>}
        <form className="form form--login" onSubmit={handleUserSignIn}>
          <div className="form-group ma-bt-md">
            <label htmlFor="password" className="form__label">
              Username
            </label>
            <input
              type="text"
              value={values.username}
              name="username"
              onChange={handleInputChange}
              className="form__input"
              required
              placeholder="Wisdom Elue"
            />
          </div>
          <div className="form-group ma-bt-md">
            <label htmlFor="password" className="form__label">
              Email Address
            </label>
            <input
              type="email"
              value={values.email}
              name="email"
              ref={emailRef}
              onChange={handleInputChange}
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
              value={values.password}
              name="password"
              ref={passwordRef}
              onChange={handleInputChange}
              placeholder="••••••••"
              required
              minLength="8"
            />
          </div>
          <div className="form__group ma-bt-md">
            <label htmlFor="password" className="form__label">
              Confirm Password
            </label>
            <input
              type="password"
              className="form__input"
              value={values.confirmPassword}
              name="confirmPassword"
              ref={passwordRef}
              onChange={handleInputChange}
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
                Proceed
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
