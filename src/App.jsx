import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import AboutPage from "./AboutPage";
import AdminPage from "./AdminPage";
import EditPost from "./EditPost";
import PostView from "./PostView";
import PrivateRoute from "./PrivateRoute"; // Import the PrivateRoute component
import Unauthorized from "./Unauthorized";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <PrivateRoute>
              <EditPost />
            </PrivateRoute>
          }
        />
        <Route path="/post/:id" element={<PostView />} />
        <Route path="/unauthorized" elment={<Unauthorized />} />
      </Routes>
    </Router>
  );
}

export default App;
