import { Navigate } from "react-router-dom";
import secureLocalStorage from "react-secure-storage";

const ProtectedRoutes = ({children}) => {
    const isAuthenticated = secureLocalStorage.getItem("isAuthenticated") === "true";
    if(!isAuthenticated){
        secureLocalStorage.removeItem("isAuthenticated");
        secureLocalStorage.removeItem("sessionTimeOut");
        return <Navigate to="/"/>
    }
    return children;
}

export default ProtectedRoutes;