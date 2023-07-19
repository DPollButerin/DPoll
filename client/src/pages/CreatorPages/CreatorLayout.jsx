import React from "react";
import { Routes, Route } from "react-router-dom";
// import DAO from "./DAO";
import { Outlet } from "react-router-dom";
// import RespondentHistoric from "./RespondentHistoric";
// import RespondentAnswer from "./RespondentAnswer";
// import RespondentClaim from "./RespondentClaim";
// import DAOPollCreation from "./DAOPollCreation";
// import DAOPollsState from "./DAOPollsState";
import PollCreation from "./PollCreation";
import PollsState from "./PollsState";
import Creator from "./Creator";

const CreatorLayout = () => {
  return (
    <div>
      RESPONDENT LAYOUT
      <Routes>
        <Route path="/" element={<Creator />} />
        <Route path="/PollCreation" element={<PollCreation />} />
        <Route path="/PollsState" element={<PollsState />} />
      </Routes>
      <Outlet context={{ hello: "From Creator navbar" }} />
    </div>
  );
};

export default CreatorLayout;
