import React from "react";
import { Select } from "@chakra-ui/react";

//affihcer list des clones creer par PollFactory => et reduire à ceux pour le quel add est owner
//pouvoir selectionner => declenche affichage du suivi
//là avoir stauts du sondage et bouton : soumettre à dao, ouvrir, close, recuperer les resultats
const PollsState = () => {
  return (
    <>
      <Select placeholder="choisissez un de vos sondages">
        <option value="sondage1">Sondage 1</option>
      </Select>
    </>
  );
};

export default PollsState;
