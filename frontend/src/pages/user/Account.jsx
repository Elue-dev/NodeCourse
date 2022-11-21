import { useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import {
  getUser,
  REMOVE_ACTIVE_USER,
  SET_ACTIVE_USER,
} from '../../redux/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import { BeatLoader } from 'react-spinners';
import { showAlert } from '../../utils/Alert';
import defaultImg from '../../img/users/default.jpg';

const initialAuthData = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export default function Account() {
  const currentUser = useSelector(getUser);

  console.log(currentUser.role);

  const initialUserData = {
    name: currentUser?.name,
    email: currentUser?.email,
  };

  const [user, setUser] = useState(initialUserData);
  const [auth, setAuth] = useState(initialAuthData);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [error_auth, setErrorAuth] = useState(null);
  const [message_auth, setMessageAuth] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleAuthChange = (e) => {
    const { name, value } = e.target;
    setAuth({ ...auth, [name]: value });
  };

  const handleImageChange = (e) => {
    const imageFile = e.target.files[0];
    setFile(imageFile);
    setUploadSuccess(
      'Image successfully changed, click on "SAVE SETTINGS" to reflect changes'
    );
  };

  const handleDataUpdate = async (e) => {
    e.preventDefault();

    setLoading(true);
    setUploadSuccess(null);
    setError(null);
    setMessage(null);

    const formData = new FormData();

    formData.append('name', user.name);
    formData.append('email', user.email);
    formData.append('photo', file);

    if (!user.email || !user.name) {
      setLoading(false);
      return showAlert('error', 'Both Name and Email fields must be filled');
    }

    let res;

    try {
      res = await axios.patch(
        `http://localhost:5000/api/v1/users/updateMe/${currentUser._id}`,
        formData
      );
      if (res?.data.status === 'success') {
        showAlert('success', 'Credentials Updated Successfully!');
        dispatch(SET_ACTIVE_USER(res.data.data.user));
        setTimeout(() => window.location.reload, 5000);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      showAlert('error', error.response?.data.message);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    setAuthLoading(true);
    setErrorAuth(null);
    setMessageAuth(null);

    const data = {
      password: auth.newPassword,
      passwordConfirm: auth.confirmPassword,
      passwordCurrent: auth.currentPassword,
    };

    let res;

    try {
      res = await axios.patch('/api/v1/users/update-password', data);
      if (res?.data.status === 'success') {
        setAuth(initialAuthData);
        showAlert(
          'success',
          'Password Updated Successfully!, Redirecting to login...'
        );
        dispatch(REMOVE_ACTIVE_USER());
        setTimeout(() => navigate('/login'), 8000);
      }
      setAuthLoading(false);
    } catch (error) {
      setAuthLoading(false);
      showAlert('error', error.response?.data.message);
    }
  };

  return (
    <main className="main">
      <div className="user-view">
        <nav className="user-view__menu">
          <ul className="side-nav">
            <li className="side-nav--active">
              <Link
                to={`/user/${user.name.replace(' ', '')}/${currentUser._id}`}
              >
                Settings
              </Link>
            </li>
            <li>
              <Link to="/my-bookings">My bookings</Link>
            </li>
            <li>
              <Link to="/my-reviews">Reviews</Link>
            </li>
          </ul>
          {currentUser.role === 'admin' || currentUser.role === 'lead-guide' ? (
            <div className="admin-nav">
              <h1 className="admin-nav__heading">Admin / Lead Guides</h1>
              <ul className="side-nav">
                <li>
                  <Link to="/">Manage tours</Link>
                </li>
                <li>
                  <Link to="/">Manage users</Link>
                </li>
                <li>
                  <Link to="/">Manage reviews</Link>
                </li>
              </ul>
            </div>
          ) : null}
        </nav>
        <div className="user-view__content">
          <div className="user-view__form-container">
            <h2 className="heading-secondary ma-bt-md">
              Your account settings
            </h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}
            <form className="form form-user-data" onSubmit={handleDataUpdate}>
              <div className="form__group">
                <label htmlFor="name" className="form__label">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={user.name}
                  onChange={handleUserChange}
                  className="form__input"
                />
              </div>
              <div className="form__group ma-bt-md">
                <label htmlFor="email" className="form__label">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleUserChange}
                  className="form__input"
                />
              </div>
              {uploadSuccess && (
                <p style={{ color: 'green', marginBottom: '.5rem' }}>
                  {uploadSuccess}
                </p>
              )}
              <div className="form__group form__photo-upload">
                {currentUser?.photo ? (
                  <img
                    src={`../../img/users/${currentUser?.photo}`}
                    alt={user.name}
                    className="form__user-photo"
                  />
                ) : (
                  <img
                    src={defaultImg}
                    alt={user.name}
                    className="form__user-photo"
                  />
                )}

                <label htmlFor="photo" className="form__label photo__label">
                  Choose New Photo
                </label>
                <input
                  type="file"
                  onChange={(e) => handleImageChange(e)}
                  accept="image/*"
                  className="form__upload"
                  name="photo"
                  id="photo"
                />
              </div>
              <div className="form__group right">
                {loading ? (
                  <button
                    className="btn btn--small btn--green"
                    type="buttton"
                    disabled
                  >
                    <BeatLoader loading={loading} size={10} color={'#fff'} />{' '}
                  </button>
                ) : (
                  <button className="btn btn--small btn--green" type="submit">
                    Save settings
                  </button>
                )}
              </div>
            </form>
          </div>
          <div className="line"></div> &nbsp;
          <div className="user-view__form-container">
            <h2 className="heading-secondary ma-bt-md">Password change</h2>
            {error_auth && <p style={{ color: 'red' }}>{error_auth}</p>}
            {message_auth && <p style={{ color: 'green' }}>{message_auth}</p>}
            <form
              className="form form-user-settings"
              onSubmit={handlePasswordUpdate}
            >
              <div className="form__group">
                <label htmlFor="currentPassword" className="form__label">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={auth.currentPassword}
                  onChange={handleAuthChange}
                  className="form__input"
                  placeholder="••••••••"
                  required
                  minLength="8"
                />
              </div>
              <div className="form__group">
                <label htmlFor="newPassword" className="form__label">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={auth.newPassword}
                  onChange={handleAuthChange}
                  className="form__input"
                  placeholder="••••••••"
                  required
                  minLength="8"
                />
              </div>
              <div className="form__group ma-bt-lg">
                <label htmlFor="confirmPassword" className="form__label">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={auth.confirmPassword}
                  onChange={handleAuthChange}
                  className="form__input"
                  placeholder="••••••••"
                  required
                  minLength="8"
                />
              </div>
              <div className="form__group right">
                {authLoading ? (
                  <button
                    className="btn btn--small btn--green"
                    type="button"
                    disabled
                  >
                    <BeatLoader
                      loading={authLoading}
                      size={10}
                      color={'#fff'}
                    />
                  </button>
                ) : (
                  <button className="btn btn--small btn--green" type="submit">
                    Save Password
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
