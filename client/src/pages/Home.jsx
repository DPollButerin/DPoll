import React from "react";
import { Link, Outlet } from "react-router-dom";

const Home = () => {
  return (
    <>
      <div>Home</div>

      <header style={{ backgroundColor: "gray" }}>
        <h1>HOME Header</h1>
      </header>
      <nav style={{ backgroundColor: "yellow" }}>
        <h1>HOME</h1>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/Respondent">Respondent</Link>
          </li>
          <li>
            <Link to="/Creator">Creator</Link>
          </li>
          <li>
            <Link to="/DAO">DAO</Link>
          </li>
          <li>
            <Link to="/About">About</Link>
          </li>
        </ul>
      </nav>
      <Outlet context={{ hello: "From Outlet" }} />
    </>
  );
};

export default Home;
