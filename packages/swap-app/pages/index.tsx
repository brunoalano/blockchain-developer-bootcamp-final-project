import type { NextPage } from "next";
import { useEtherBalance, useEthers, useTokenBalance } from "@usedapp/core";
import { formatEther, formatUnits } from "@ethersproject/units";
import { useContext } from "react";
import { DeploymentsContext } from "lib/deployments";

const Home: NextPage = () => {
  const deploymentsContext = useContext(DeploymentsContext);

  const { activateBrowserWallet, account, library, deactivate, chainId } =
    useEthers();
  const etherBalance = useEtherBalance(account);

  const tokenBalance = useTokenBalance(
    "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    account
  );

  if (typeof library === "undefined") {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      {!account && (
        <button onClick={() => activateBrowserWallet()}> Connect </button>
      )}
      {account && <button onClick={deactivate}> Disconnect </button>}
      {account && <p>Account: {account}</p>}
    </div>
  );
};

export default Home;
