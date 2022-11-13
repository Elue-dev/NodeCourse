import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/header/Header';
import Login from './pages/auth/Login';
import Overview from './pages/overview/Overview';
import Signup from './pages/auth/Signup';
import ProtectAuthRoutes from './components/protect/ProtectAuthRoutes';
import Account from './pages/user/Account';
import TourDetail from './pages/overview/TourDetail';
import ProtectRoute from './components/protect/ProtectRoute';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route
          exact
          path="/"
          element={
            <ProtectRoute>
              <Overview />
            </ProtectRoute>
          }
        />
        <Route
          path="/:id"
          element={
            <ProtectRoute>
              <TourDetail />
            </ProtectRoute>
          }
        />
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

        <Route
          path="/user/:name/:id"
          element={
            <ProtectRoute>
              <Account />
            </ProtectRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
