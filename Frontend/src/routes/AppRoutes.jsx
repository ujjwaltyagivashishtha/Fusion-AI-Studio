import { Route, BrowserRouter, Routes } from "react-router-dom";
import Login from "../components/Login.jsx";
import Register from '../components/Register.jsx';
import Home from '../components/Home.jsx';



const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='login' element={<Login/>} />
        <Route path='register' element={<Register/>} />
        
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes;