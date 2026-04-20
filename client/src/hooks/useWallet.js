import { useState, useEffect, useCallback } from "react";
import { BrowserProvider } from "ethers";

export function useWallet() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [chainId, setChainId] = useState(null);

  const SEPOLIA_CHAIN_ID = "0xaa36a7";

  const checkConnection = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        const p = new BrowserProvider(window.ethereum);
        setProvider(p);
        const network = await p.getNetwork();
        setChainId("0x" + network.chainId.toString(16));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    checkConnection();
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accs) => setAccount(accs[0] || null));
      window.ethereum.on("chainChanged", () => window.location.reload());
    }
  }, [checkConnection]);

  const connect = async () => {
    if (!window.ethereum) {
      setError("MetaMask not detected. Please install MetaMask.");
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      const p = new BrowserProvider(window.ethereum);
      setProvider(p);
      const network = await p.getNetwork();
      const cid = "0x" + network.chainId.toString(16);
      setChainId(cid);

      if (cid !== SEPOLIA_CHAIN_ID) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
      }
    } catch (e) {
      setError(e.message || "Connection failed");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setProvider(null);
  };

  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : null;

  const isCorrectNetwork = chainId === SEPOLIA_CHAIN_ID;

  return { account, provider, connect, disconnect, isConnecting, error, shortAddress, isCorrectNetwork };
}
