import { useContext } from "react";
import ConnectionContext from "./ConnectionContext";

/*
@dev useConnection() is a custom hook that returns the value of the ConnectionContext.
It is used in the components to access the value of the ConnectionContext.
*/
const useConnection = () => useContext(ConnectionContext);

export default useConnection;
