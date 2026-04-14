import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import './Stylesheets/index.css';
import Homepage from './Components/Homepage.tsx';
import SignUpPage from './Components/SignUpPage.tsx'
import LoginPage from "./Components/LoginPage.tsx";

const router = createBrowserRouter([
        {path: "/", Component: Homepage},
        {path: "/signup", Component: SignUpPage},
        {path: "/login", Component: LoginPage}
])

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
)
