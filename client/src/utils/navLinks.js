import {
  FaHouseChimney,
  FaPuzzlePiece,
  // FaSchoolFlag,
  FaUserLarge,
  // FaQuestion,
  FaPlus,
  FaClockRotateLeft,
  FaRegAddressCard,
  FaRegCircleCheck,
  FaRegCircleQuestion,
  FaRegPenToSquare,
  FaTableList,
  FaLandmarkDome,
  // FaAddressCard,
  FaSackDollar,
  FaPenToSquare,
} from "react-icons/fa6";

/**
 * @name group
 * @description sub navigation links grouped by section containing icon, path and text for each link button
 * @property {Array} respondent - links for respondent pages
 * @property {Array} creator - links for creator pages
 * @property {Array} dao - links for dao pages
 * @returns {Object} navigation links grouped by section
 */
const group = {
  respondent: [
    {
      icon: <FaTableList />,
      to: "/Respondent/Historic",
      text: "Historique",
    },
    {
      icon: <FaRegPenToSquare />,
      to: "/Respondent/Answer",
      text: "Répondre",
    },
    { icon: <FaSackDollar />, to: "/Respondent/Claim", text: "Rewards" },
  ],
  creator: [
    {
      icon: <FaPlus />,
      to: "/Creator/PollCreation",
      text: "Nouveau sondage",
    },
    { icon: <FaClockRotateLeft />, to: "/Creator/PollsState", text: "Suivi" },
  ],
  dao: [
    {
      icon: <FaRegCircleCheck />,
      to: "/DAO/PollValidation",
      text: "Valider un sondage",
    },
    {
      icon: <FaPenToSquare />,
      to: "/DAO/Proposals",
      text: "Vote de gouvernance",
    },
    { icon: <FaRegAddressCard />, to: "/DAO/Signin", text: "Devenir membre" },
  ],
};

/**
 * @name single
 * @description main navigation links  containing icon, path and text for each link button
 * @property {Object} home - link for home
 * @property {Object} about - link for about
 * @property {Object} respondent - link for respondent
 * @property {Object} creator - link for creator
 * @property {Object} dao - link for dao
 * @returns {Object} navigation links
 */
const single = {
  home: {
    icon: <FaHouseChimney />,
    to: "/",
    text: "Home",
  },
  about: {
    icon: <FaRegCircleQuestion />,
    to: "/About",
    text: "Aide",
  },
  respondent: {
    icon: <FaUserLarge />,
    to: "/Respondent",
    text: "Répondant",
  },
  creator: {
    icon: <FaPuzzlePiece />,
    to: "/Creator",
    text: "Créateur",
  },
  dao: {
    icon: <FaLandmarkDome />,
    to: "/DAO",
    text: "Gouvernance",
  },
};

export { group, single };

/*add ref metemask icon :
<a target="_blank" href="https://icons8.com/icon/Oi106YG9IoLv/metamask-logo">Metamask Logo</a> icon by < a target = "_blank" href = "https://icons8.com" > Icons8</ >
*/
