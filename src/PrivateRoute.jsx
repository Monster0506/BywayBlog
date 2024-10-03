import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Unauthorized from "./Unauthorized";
import { is_admin } from "./utils";

const PrivateRoute = ({ children, requiresAdmin = false }) => {
  const [isAllowed, setIsAllowed] = useState(null); // `null` while checking, `true` or `false` after

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (requiresAdmin) {
          setIsAllowed(is_admin(user.uid));
        } else {
          setIsAllowed(true);
        }
      } else {
        setIsAllowed(false);
      }
    });

    return () => unsubscribe();
  }, [requiresAdmin]);

  if (isAllowed === null) {
    // Render loading state while checking
    return <div>Loading...</div>;
  }

  return isAllowed ? children : <Unauthorized />;
};

export default PrivateRoute;
