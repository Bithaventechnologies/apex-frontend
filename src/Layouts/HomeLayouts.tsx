import { Outlet } from "react-router-dom";
import Header from "../Components/HomeHeader";
import Footer from "../Components/HomeFooter";
// import ScrollToTop from "../components/ScrollToTop";

const Homelayout = () => {
  return (
    <>
    {/* <ScrollToTop/> */}
      <Header />
      <Outlet />
      <Footer />
    </>
  );
};

export default Homelayout;