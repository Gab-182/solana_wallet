import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import { Button, Alert, Popconfirm } from "antd";
import PhraseBox from "../components/PhraseBox";
import { useGlobalState } from "../context";
import { LoadingOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import * as Bip39 from "bip39";
import { Keypair } from "@solana/web3.js";
/*********************************************************************************************************/
const Phrase: NextPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const { setAccount, mnemonic, setMnemonic } = useGlobalState();

  const router = useRouter();
/*********************************************************************************************************/
  useEffect(() => {
	/*
	 * *Step 2*:
	 * =========
	 * implement a function that generates a mnemonic when the page renders,
	 * and uses it to create a wallet.
	 * 1- review the import guidance on lines 9 and 11
	 * 2- generate a mnemonic phrase by importing Bip39 and then implementing the 
	 * appropriate method on the imported Bip39 instance.
	 */
	const generatedMnemonic = Bip39.generateMnemonic();
	/*This line saves the mnemonic phrase to context state so we can 
	 *display it for the wallet user to copy
	 */
	setMnemonic(generatedMnemonic);
	/* 
	 * 3- convert the mnemonic to seed bytes and make sure it's 32-bytes.
	 * [.slice(0, 32)] ---> slice the seed and keep only the first 32 bytes: 
	*/
	const seed = Bip39.mnemonicToSeedSync(generatedMnemonic).slice(0, 32);
	/* for testing: */
	//console.log(seed);

	/*4- use "seed" to generate a new account */
	const newAccount = Keypair.fromSeed(seed);

	/* This line sets the account to context state so it can be used by the app */
	setAccount(newAccount);
  }, []);
/*********************************************************************************************************/
  const showPopconfirm = () => {
	setVisible(true);
  };

  const handleOk = () => {
	setLoading(true);
	router.push("/wallet");
  };

  const handleCancel = () => {
	setVisible(false);
  };

  const warning =
	"Keep this phrase secret and safe.\
	 This is the only way for you to access your digital assets.\
	 Moreover, anyone can access your assets with it!";

  return (
	<>
	  <h1 className={"title"}>Secret Recovery Phrase</h1>

	  <p>
		This recovery phrase is generated with your private keys and can be used
		to recover your account.
	  </p>

	  <Alert message={warning} type="warning" />

	  <p>
		Once you have stored this phrase somewhere safe, click finish to go to
		your wallet.
	  </p>

	  <PhraseBox mnemonic={mnemonic}></PhraseBox>

	  {!loading && (
		<Popconfirm
		  title="Did you copy the phrase?"
		  visible={visible}
		  onConfirm={handleOk}
		  okButtonProps={{ loading: loading }}
		  onCancel={handleCancel}
		  cancelText={"No"}
		  okText={"Yes"}
		>
		  <Button type="primary" onClick={showPopconfirm}>
			Finish
		  </Button>
		</Popconfirm>
	  )}

	  {loading && <LoadingOutlined style={{ fontSize: 24 }} spin />}
	</>
  );
};

export default Phrase;
