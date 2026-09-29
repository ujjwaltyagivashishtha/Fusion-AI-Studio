import { Route, BrowserRouter, Routes } from "react-router-dom";
import Login from "../components/Login.jsx";
import Register from '../components/Register.jsx';
import Home from '../components/Home.jsx';
import Project from '../components/Project.jsx';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/project" element={<Project />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes;