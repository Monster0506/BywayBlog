import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import AboutPage from "./AboutPage";
import AdminPage from "./AdminPage";
import EditPost from "./EditPost";
import PostView from "./PostView";
import PrivateRoute from "./PrivateRoute";
import Unauthorized from "./Unauthorized";
import UserSettings from "./UserSettings";

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
            <PrivateRoute requiresAdmin={true}>
              <AdminPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <PrivateRoute requiresAdmin={true}>
              <EditPost />
            </PrivateRoute>
          }
        />
        <Route path="/post/:id" element={<PostView />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* User Settings Page - No admin check */}
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <UserSettings />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
