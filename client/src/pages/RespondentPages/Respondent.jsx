import React from "react";
import { useOutletContext } from "react-router-dom";

const Respondent = () => {
  const objOutlet = useOutletContext();
  const m = objOutlet.hello;
  return <div>Respondent MAIN PAGE{m}</div>;
};

export default Respondent;
