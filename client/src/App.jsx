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
import { ContractsProvider } from "./contexts/ContractsContext";

function App() {
  const p = useParams();
  console.log(p);
  const n = useNavigate();
  console.log(n);

  useEffect(() => {
    console.log("App.jsx useEffect");
    console.log(p, n);
  }, [p, n]);

  return (
    <>
      <ChakraProvider>
        <ConnectionProvider>
          <ContractsProvider>
            <Routes>
              <Route
                path="/"
                element={<Home style={{ backgroundColor: "yellow" }} />}
              />
              <Route element={<MainLayout />}>
                <Route path="/Respondent/*" element={<RespondentLayout />} />
                <Route path="/Creator/*" element={<CreatorLayout />} />
                <Route path="/DAO/*" element={<DAOLayout />} />
              </Route>
              <Route path="/About" element={<About />} />
              <Route path="*" element={<div>Not FOund</div>} />
            </Routes>
          </ContractsProvider>
        </ConnectionProvider>
      </ChakraProvider>
    </>
  );
}

export default App;
