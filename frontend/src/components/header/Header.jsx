import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { getUser, REMOVE_ACTIVE_USER } from '../../redux/authSlice';

export default function Header() {
  const user = useSelector(getUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutUser = async () => {
    await axios.get('http://localhost:5000/api/v1/users/logout');
    dispatch(REMOVE_ACTIVE_USER());
    localStorage.removeItem('token');

    navigate('/login');
  };

  return (
    <header className="header">
      <nav className="nav nav--tours">
        <Link to="/" className="nav__el">
          All tours
        </Link>
        <form className="nav__search">
          <button className="nav__search-btn">
            <svg></svg>
          </button>
          <input
            type="text"
            placeholder="Search tours"
            className="nav__search-input"
          />
        </form>
      </nav>
      <div className="header__logo">
        <img src="../../img/logo-white.png" alt="Natours logo" />
      </div>
      <nav className="nav nav--user">
        {user ? (
          <>
            <Link
              to={`/user/${user.name.replace(' ', '')}/${user._id}`}
              className="nav__el"
            >
              {user.name.split(' ')[0]} &nbsp;
              {user.photo ? (
                <img
                  src={`../../img/users/${user.photo}`}
                  alt={user.name}
                  className="nav__user-img"
                />
              ) : (
                <img
                  src={`../../img/users/default.jpg`}
                  alt={user.name}
                  className="nav__user-img"
                />
              )}
            </Link>
            <button className="nav__el nav__el--cta" onClick={logoutUser}>
              Log out
            </button>
          </>
        ) : (
          <>
            <button className="nav__el nav__el--cta">
              <Link to="/signup">Sign up</Link>
            </button>
            <button className="nav__el nav__el--cta">
              <Link to="/login">Log in</Link>
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
