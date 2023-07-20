// import { EthProvider } from "./contexts/EthContext";
// import Intro from "./components/Intro/";
// import Setup from "./components/Setup";
// import Demo from "./components/Demo";
// import Footer from "./components/Footer";
import { ChakraProvider } from "@chakra-ui/react";

import { Routes, Route, useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import MainLayout from "./pages/MainLayout";
// import { Redirect } from "react-router-dom";
import { useEffect } from "react";
// import { useHistory } from "react-router-dom";
import { useLocation } from "react-router-dom";
import RespondentLayout from "./pages/RespondentPages/RespondentLayout";
import CreatorLayout from "./pages/CreatorPages/CreatorLayout";
import DAOLayout from "./pages/DAOPages/DAOLayout";
import { ConnectionProvider } from "./contexts/ConnectionContext";

function App() {
  const p = useParams();
  console.log(p);
  const n = useNavigate();
  console.log(n);
  // const h = useHistory();
  // console.log(h);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    navigate(location.pathname, {});
    // reload and pass empty object to clear state
    // we can also use replace option: ..., {replace: true}
    // const location = useLocation();
  }, [location.pathname, navigate]);

  useEffect(() => {
    console.log("App.jsx useEffect");
    console.log(p, n);
    // if (p.id === undefined) {
    //   console.log("p.id === undefined");
    //   n("/Home");
    // }npm run start
  }, [p, n]);

  return (
    <>
      <ChakraProvider>
        <ConnectionProvider>
          <Routes>
            <Route
              path="/" //"\/|/Home\"
              element={<Home style={{ backgroundColor: "yellow" }} />}
            />
            <Route element={<MainLayout />}>
              <Route path="/Respondent/*" element={<RespondentLayout />} />
              <Route path="/Creator/*" element={<CreatorLayout />} />
              <Route path="/DAO/*" element={<DAOLayout />} />
            </Route>
            <Route path="/About" element={<About />} />
            <Route path="*" element={<div>Not FOund</div>} />
            {/* <Redirect to="/Home" /> */}
          </Routes>
        </ConnectionProvider>
      </ChakraProvider>
    </>
  );
}

export default App;
