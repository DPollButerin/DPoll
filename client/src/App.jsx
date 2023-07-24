import "@fontsource/poppins/500.css";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme";
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
import { TxProvider } from "./contexts/TxContext/TxContext";

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
    // <>
    <ChakraProvider theme={theme}>
      {" "}
      {/* theme={theme}> */}
      <ConnectionProvider>
        <ContractsProvider>
          <TxProvider>
            <Routes>
              <Route
                path="/"
                element={<Home style={{ backgroundColor: "#E8E8E8" }} />}
              />
              <Route element={<MainLayout />}>
                <Route path="/Respondent/*" element={<RespondentLayout />} />
                <Route path="/Creator/*" element={<CreatorLayout />} />
                <Route path="/DAO/*" element={<DAOLayout />} />
              </Route>
              <Route path="/About" element={<About />} />
              <Route path="*" element={<div>Not FOund</div>} />
            </Routes>
          </TxProvider>
        </ContractsProvider>
      </ConnectionProvider>
    </ChakraProvider>
    // {/* </> */}
  );
}

export default App;
