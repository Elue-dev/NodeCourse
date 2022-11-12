import Header from './components/header/Header';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <Routes>
          {/* <Route exact path="/" element={<Overview />} /> */}
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
