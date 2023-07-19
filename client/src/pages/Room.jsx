import React from "react";
import { useOutletContext, useParams } from "react-router-dom";

const Room = () => {
  const { id } = useParams();
  console.log(id);
  const obj = useOutletContext();
  return <h1>Room</h1>;
};

export default Room;
