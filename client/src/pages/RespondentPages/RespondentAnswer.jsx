import React from "react";
import { useOutletContext } from "react-router-dom";

const RespondentAnswer = () => {
  const objOutlet = useOutletContext(); //virer
  return <div>RespondentAnswer {objOutlet.second} </div>;
};

export default RespondentAnswer;
