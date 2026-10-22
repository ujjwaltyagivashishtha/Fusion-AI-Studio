import { Route, BrowserRouter, Routes } from "react-router-dom";
import Login from "../components/Login.jsx";
import Register from '../components/Register.jsx';
import Home from '../components/Home.jsx';
import Project from '../components/Project.jsx';
import NotFound from '../components/NotFound.jsx';
import UserAuth from '../auth/userAuth.jsx';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserAuth><Home /></UserAuth>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/project" element={<UserAuth><Project /></UserAuth>} />
        <Route path="/project/:id" element={<UserAuth><Project /></UserAuth>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes;