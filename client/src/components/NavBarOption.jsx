import React from "react";
import { Link, Outlet, Routes, Route } from "react-router-dom";
import { Button, VStack } from "@chakra-ui/react";
import NavButton from "./NavButton";
import { getUUID } from "../utils/helpers";

const NavBarOption = ({ details }) => {
  return (
    <VStack w="100%" style={{ backgroundColor: "orange" }}>
      <header style={{ color: "red" }}>
        <h1>NAVABR </h1>
      </header>
      {details.map((detail) => {
        console.log("detail LOOP", detail);
        return (
          //   <li key={pageRoute.route + getUUID}>
          <NavButton
            // style={{ backgroundColor: pageRoute.color }} AJOUTER ICON
            key={detail.to + getUUID}
            detail={detail}
          />
          //   </li>
        );
      })}

      <Outlet context={{ hello: "From Respondent navbar" }} />
    </VStack>
  );
};

export default NavBarOption;
