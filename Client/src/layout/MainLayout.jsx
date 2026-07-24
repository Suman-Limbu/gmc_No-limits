import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

 const MainLayout = () => {
  return (
    <div className="h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-16">
        <Outlet />
      </main>

      {/* <Footer /> */}
    </div>
  );
};


export default MainLayout;