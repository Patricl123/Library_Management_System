import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="app-shell">
      <div className="background-orb background-orb-left" />
      <div className="background-orb background-orb-right" />
      <Navbar />
      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
