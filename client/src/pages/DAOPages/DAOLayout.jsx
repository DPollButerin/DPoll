import { useCallback, useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import DAO from "./DAO";
import { Outlet } from "react-router-dom";
// import RespondentHistoric from "./RespondentHistoric";
// import RespondentAnswer from "./RespondentAnswer";
// import RespondentClaim from "./RespondentClaim";
import DAOPollValidation from "./DAOPollValidation";
import DAOProposals from "./DAOProposals";
import DAOSignIn from "./DAOSignIn";
import { useConnection } from "../../contexts/ConnectionContext";
import { useContracts } from "../../contexts/ContractsContext";

const DAOLayout = () => {
  const { wallet } = useConnection();
  const { contractsState } = useContracts();
  const [isMember, setIsMember] = useState(false);

  const getIsMember = useCallback(async () => {
    try {
      const web3 = contractsState.web3;
      const DAOaddress = contractsState.DPollDAOAddress;
      if (web3 && DAOaddress) {
        const IDAOInstance = contractsState.web3.eth.Contract(
          contractsState.IDAOmembershipAbi,
          DAOaddress
        );
        const isDAOMember = await IDAOInstance.methods
          .isMember(wallet.accounts[0])
          .call({ from: wallet.accounts[0] });
        console.log("(DAO.jsx)/isMember IN IF", isMember);
        setIsMember(isDAOMember);
      }
    } catch (e) {
      console.log("(DAO.jsx)/isMember ERROR", e);
    }
  });

  useEffect(() => {
    console.log(
      "DAOLayout useEffect WATCHING contractsState CHANGES",
      contractsState
    );
    getIsMember();
    console.log("DAOLayout useEffect WATCHING isMember CHANGES", isMember);
  }, [contractsState, getIsMember]);

  useEffect(() => {
    console.log("DAOLayout useEffect WATCHING MEMBERSHIP CHANGES", isMember);
  }, [isMember]);

  return (
    <div>
      DAO LAYOUT
      <Routes>
        <Route path="/" element={<DAO />} />
        <Route path="/PollValidation" element={<DAOPollValidation />} />
        <Route path="/Proposals" element={<DAOProposals />} />
        <Route
          path="/Signin"
          element={<DAOSignIn isMemeber={isMember} setIsMember={setIsMember} />}
        />
      </Routes>
      <Outlet context={{ hello: "From Respondent navbar" }} />
    </div>
  );
};

export default DAOLayout;
