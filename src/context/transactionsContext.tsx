import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { contractAbi, contractAddress } from "../ultils/constants";
import { contract } from "../ultils/constants";

const { ethereum } = window;

type FormDataType = {
  addressTo: string;
  amount: string;
  keyword: string;
  message: string;
};

type TransactionContextType = {
  connectWallet: () => any;
  connectedAccount: string;
  handleChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => any;
  formData: FormDataType;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
  sendTransaction: () => Promise<any>;
  isLoading: boolean;
  transactionCount: number;
  transactions: any[];
};

export const TransactionContext =
  React.createContext<TransactionContextType | null>(null);

export const getEthereumContract = async () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const transactionsContract = new ethers.Contract(
    contractAddress,
    contractAbi,
    signer
  );

  return transactionsContract;
};

export const TransactionProvider = ({ children }: any) => {
  const [connectedAccount, setConnectedAccount] = useState("");
  const [formData, setFormData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });
  const [transactionCount, setTransactionCount] = useState(
    Number(localStorage.getItem("transactionCount")) || 0
  );
  const [transactions, setTransactions] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => {
    setFormData((pre) => ({ ...pre, [name]: event.target.value }));
  };

  const checkIfWalletIsConnectted = async () => {
    try {
      if (!ethereum) return <h1>please install metamark</h1>;
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts && accounts.length) {
        setConnectedAccount(accounts[0]);
      }
    } catch (error: any) {
      console.log({ error });
      throw new Error(error?.message);
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("please install metamark!!");
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setConnectedAccount(accounts[0]);
    } catch (error) {
      console.log({ error });
      throw new Error("no ethereum object ");
    }
  };

  const sendTransaction = async () => {
    try {
      if (!ethereum) return alert("please install metamark!!");
      const { addressTo, amount, message, keyword } = formData;
      const tran = await getEthereumContract();
      const amountParse = ethers.utils.parseEther(formData.amount);
      await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: connectedAccount,
            to: formData.addressTo,
            gas: "0x5208",
            value: amountParse._hex,
          },
        ],
      });
      const tranHash = await tran.addToBlockChain(
        addressTo,
        amountParse,
        message,
        keyword
      );

      setIsLoading(true);
      console.log(`loading-${tranHash.hash}`);

      await tranHash.wait();
      setIsLoading(false);

      console.log(`success-${tranHash.hash}`);

      const tranCount = await tran.getTrasactionCount();
      setTransactionCount(tranCount.toNumber());
    } catch (error) {
      console.log({ error });
      throw new Error("no ethereum object ");
    }
  };

  const getAllTransactions = async () => {
    try {
      if (!ethereum) return alert("please install metamark!!");
      const { addressTo, amount, message, keyword } = formData;
      const tran = await getEthereumContract();

      const transactions: any[] = await tran.getAllTransactions();
      console.log({transactions});
      
      const trans: any[] = transactions.map((x, i) => {
        return {
          ...x,
          addressTo: x.receiver,
          addressFrom: x.from,
          timestamp: new Date(x.timestamp.toNumber() * 1000).toLocaleString(),
          amount: (parseInt(x.amount._hex) * 10 ** 18).toString(),
        };
      });

      setTransactions(trans);
    } catch (error) {
      console.log({ error });
      throw new Error("no ethereum object ");
    }
  };
  useEffect(() => {
    checkIfWalletIsConnectted();
    getAllTransactions();
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        connectedAccount,
        handleChange,
        formData,
        setFormData,
        sendTransaction,
        isLoading,
        transactionCount,
        transactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
