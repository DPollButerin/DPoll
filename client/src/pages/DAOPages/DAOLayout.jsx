import React from "react";
import { Routes, Route } from "react-router-dom";
import DAO from "./DAO";
import { Outlet } from "react-router-dom";
// import RespondentHistoric from "./RespondentHistoric";
// import RespondentAnswer from "./RespondentAnswer";
// import RespondentClaim from "./RespondentClaim";
import DAOPollValidation from "./DAOPollValidation";
import DAOProposals from "./DAOProposals";
import DAOSignIn from "./DAOSignIn";

const DAOLayout = () => {
  return (
    <div>
      RESPONDENT LAYOUT
      <Routes>
        <Route path="/" element={<DAO />} />
        <Route path="/PollValidation" element={<DAOPollValidation />} />
        <Route path="/Proposals" element={<DAOProposals />} />
        <Route path="/Signin" element={<DAOSignIn />} />
      </Routes>
      <Outlet context={{ hello: "From Respondent navbar" }} />
    </div>
  );
};

export default DAOLayout;
