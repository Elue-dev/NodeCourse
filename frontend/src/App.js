import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/header/Header';
import Login from './pages/auth/Login';
import Overview from './pages/overview/Overview';
import Signup from './pages/auth/Signup';
import ProtectAuthRoutes from './components/protect/ProtectAuthRoutes';
import Account from './pages/user/Account';
import TourDetail from './pages/overview/TourDetail';
import ProtectRoute from './components/protect/ProtectRoute';
import Bookings from './pages/bookings/Bookings';
import Reviews from './pages/user/reviews/Reviews';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route exact path="/" element={<Overview />} />
        <Route path="/:id" element={<TourDetail />} />
        <Route
          path="/login"
          element={
            <ProtectAuthRoutes>
              <Login />
            </ProtectAuthRoutes>
          }
        />
        <Route
          path="/signup"
          element={
            <ProtectAuthRoutes>
              <Signup />
            </ProtectAuthRoutes>
          }
        />
        {/* <Route
          path="/account/*"
          element={
            <ProtectRoute>
              <Account />
            </ProtectRoute>
          }
        /> */}
        <Route
          path="/user/:name/:id"
          element={
            <ProtectRoute>
              <Account />
            </ProtectRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectRoute>
              <Bookings />
            </ProtectRoute>
          }
        />
        <Route
          path="/my-reviews"
          element={
            <ProtectRoute>
              <Reviews />
            </ProtectRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
