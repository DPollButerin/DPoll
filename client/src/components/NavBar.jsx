import React from "react";
import { Link, Outlet, Routes, Route } from "react-router-dom";

const NavBar = ({ pagesRoutes, msg, color }) => {
  const getUUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  };

  return (
    <>
      <header style={{ backgroundColor: color }}>
        <h1>NAVABR {msg}</h1>
      </header>
      <nav style={{ backgroundColor: color }}>
        <h1>manu repsondent</h1>
        <ul>
          {pagesRoutes.map((pageRoute) => {
            return (
              <li key={pageRoute.route + getUUID}>
                <button style={{ backgroundColor: pageRoute.color }}>
                  <Link to={pageRoute.route}>{pageRoute.msg}</Link>
                </button>
              </li>
            );
          })}
          {/* <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/Respondent">Respondent</Link>
          </li> */}
          {/* <li>
            <Link to="/Respondent/Polls">repondre</Link>
          </li>
          <li>
            <Link to="/Respondent/Proposals">DAO</Link>
          </li>
          <li>
            <Link to="/Respondent/Claim">CLAIM</Link>
          </li> */}
        </ul>
      </nav>

      <Outlet context={{ hello: "From Respondent navbar" }} />
    </>
  );
};

export default NavBar;
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
