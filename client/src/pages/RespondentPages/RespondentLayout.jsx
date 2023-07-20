import React from "react";
import { Routes, Route } from "react-router-dom";
import Respondent from "./Respondent";
import { Outlet } from "react-router-dom";
import RespondentHistoric from "./RespondentHistoric";
import RespondentAnswer from "./RespondentAnswer";
import RespondentClaim from "./RespondentClaim";

const RespondentLayout = () => {
  return (
    <div>
      RESPONDENT LAYOUT
      <Routes>
        <Route path="/" element={<Respondent />} />
        <Route path="/Historic" element={<RespondentHistoric />} />
        <Route path="/Answer" element={<RespondentAnswer />} />
        <Route path="/Claim" element={<RespondentClaim />} />
      </Routes>
      {/* <Outlet context={{ second: "From Respondent navbar" }} /> */}
    </div>
  );
};

export default RespondentLayout;
