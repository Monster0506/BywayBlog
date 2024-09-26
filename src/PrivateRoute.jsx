import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase"; // Adjust the path based on your project structure
import Unauthorized from "./Unauthorized"; // Import the Unauthorized component
import { is_admin } from "./utils";

const PrivateRoute = ({ children }) => {
  const [isAllowed, setIsAllowed] = useState(null); // `null` while checking, `true` or `false` after

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && is_admin(user.uid)) {
        setIsAllowed(true);
      } else {
        setIsAllowed(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (isAllowed === null) {
    // Render loading state while checking
    return <div>Loading...</div>;
  }

  return isAllowed ? children : <Unauthorized />;
};

export default PrivateRoute;
