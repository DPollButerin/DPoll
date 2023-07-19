import React from "react";
import { Link, Outlet, Routes, Route } from "react-router-dom";
// import RespondentNavBar from "./RespondentPages/RespondentNavBar";

import { matchRoutes, useLocation } from "react-router-dom";
import NavBar from "../components/NavBar";

const useCurrentPath = () => {
  const routes = [{ path: "/" }];
  const location = useLocation();
  // console.log("INcurrentPAtHlocation", location);
  // console.log("routes", routes);
  // const [{ route }] = matchRoutes(routes, location);
  // return route.path;
  return location.pathname;
};

const MainLayout = () => {
  const currentPath = useCurrentPath(); // `/members/5566` -> `/members/:id`

  const details = {
    respondent: [
      {
        route: "/Respondent/Historic",
        msg: "HISTORIQUE/LIST....",
        color: "pink",
      },
      {
        route: "/Respondent/Answer",
        msg: "PICK A POLL AND ANSWER",
        color: "pink",
      },
      {
        route: "/Respondent/Claim",
        msg: "CLAIM reward from a poll",
        color: "orange",
      },
    ],
    creator: [
      { route: "/Creator/PollCreation", msg: "CRATION POLL", color: "pink" },
      {
        route: "/Creator/PollsState",
        msg: "STATE OF OWNER POLLS",
        color: "orange",
      },
    ],
    dao: [
      { route: "/DAO/PollValidation", msg: "POLL VALIDATION", color: "pink" },
      {
        route: "/DAO/Proposals",
        msg: "DAO proposals",
        color: "pink",
      },
      { route: "/DAO/Signin", msg: "SIGNIN", color: "orange" },
    ],
  };

  return (
    <>
      <header style={{ backgroundColor: "green" }}>
        <h1>RoomLayout Header Pat pour action : {currentPath}</h1>
      </header>
      <nav style={{ backgroundColor: "red" }}>
        <h1>RoomLayout</h1>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/Respondent">Répondant</Link>
          </li>
          <li>
            <Link to="/Creator">Créateur</Link>
          </li>
          <li>
            <Link to="/DAO">Gouvernance</Link>
          </li>
          <li>
            <Link to="/About">Aide</Link>
          </li>
        </ul>
      </nav>

      <div>
        Sidebar
        <Routes style={{ backgroundColor: "blue" }}>
          {/* <Route path="/Respondent/*" element={<RespondentNavBar />} />*/}

          <Route
            path="/Respondent/*"
            element={
              <NavBar
                msg={"REPONDENT MSG BAR"}
                color={"pink"}
                pagesRoutes={details.respondent}
              />
            }
          />
          <Route
            path="/Creator/*"
            element={
              <NavBar
                msg={"CREATOR MSG BAR"}
                color={"pink"}
                pagesRoutes={details.creator}
              />
            }
          />
          <Route
            path="/DAO/*"
            element={
              <NavBar
                msg={"DAO MSG BAR"}
                color={"pink"}
                pagesRoutes={details.dao}
              />
            }
          />
          {/* <Route path="/Creator" element={<h1>Creator NAVBAR</h1>} />
          <Route path="/DAO" element={<h1>DAO NAVBAR</h1>} /> */}
        </Routes>
      </div>
      <div></div>
      <div style={{ backgroundColor: "lime" }}>
        <Outlet context={{ hello: "From Outlet" }} />
      </div>
    </>
  );
};

export default MainLayout;
//  <ul>
//    <li>
//      <Link to="/">Home</Link>
//    </li>
//    <li>
//      <Link to="/Room/Respondent">Respondent</Link>
//    </li>
//    <li>
//      <Link to="/Room/Creator">Creator</Link>
//    </li>
//    <li>
//      <Link to="/Room/DAO">DAO</Link>
//    </li>
//    <li>
//      <Link to="/Room/About">About</Link>
//    </li>
//  </ul>;
