import { useContext } from "react";
import ContractsContext from "./ContractsContext";

/*
@dev useVote() is a custom hook that returns the value of the VoteContext.
It is used in the components to access the value of the VoteContext.
*/
const useVote = () => useContext(ContractsContext);

export default useVote;
