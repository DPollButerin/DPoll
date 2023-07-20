import React from "react";
import { useOutletContext } from "react-router-dom";

const DAO = () => {
  const obj = "UNEMSG DE DAO MAIN"; //useOutletContext();
  const bal = <span>message : {obj}</span>;

  return (
    <div>
      DAO <h1>Room </h1>;
    </div>
  );
};

export default DAO;
