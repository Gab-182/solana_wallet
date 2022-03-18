import React, { useState, ReactElement } from "react";
import { message } from "antd";
import { useGlobalState } from "../../context";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
const converter = require("number-to-words");
import { LoadingOutlined } from "@ant-design/icons";
import { refreshBalance } from "../../utils";
import {
	CheckContainer,
	CheckImage,
	CheckFrom,
	Processed,
	CheckDate,
	RecipientInput,
	AmountInput,
	SignatureInput,
	AmountText,
	RatioText,
} from "../../styles/StyledComponents.styles";

type FormT = {
	from: string;
	to: string;
	amount: number;
	isSigned: boolean;
};

const defaultForm: FormT = {
	from: "",
	to: "",
	amount: 0,
	isSigned: false,
};

const TransactionModal = (): ReactElement => {
	const { network, account, balance, setBalance } = useGlobalState();
	const [form, setForm] = useState<FormT>(defaultForm);
	const [sending, setSending] = useState<boolean>(false);
	const [transactionSig, setTransactionSig] = useState<string>("");

	const onFieldChange = (field: string, value: string) => {
		if (field === "amount" && !!value.match(/\D+/)) {
			console.log(value);
			return;
		}

		setForm({
			...form,
			[field]: value,
		});
	};
/*************************************************************************************************/
	/* 
	 * *Step 5*:
	 * ========= 
	 * implement a function that transfer funds 
	 */
	const transfer = async () => {
		if (!account) return;
		try {
			/*
			 * instantiate a connection using clusterApiUrl with the active network passed in as 
			 * an argument
			 */

			const connection = new Connection(clusterApiUrl(network), "confirmed");
			setTransactionSig("");
			/* 
			 * leverage the SystemProgram class to create transfer instructions that include your account's public key, 
			 * the public key from your sender field in the form, and the amount from the form
			 */
			const instructions = SystemProgram.transfer({
				fromPubkey: account.publicKey,
				toPubkey: new PublicKey(form.to),
				lamports: form.amount,
			});

			/* instantiate a transaction object and add the instructions */

			const transaction = new Transaction().add(instructions);
			/* use your account to create a signers interface */

			const signers = [
				{
				  publicKey: account.publicKey,
				  secretKey: account.secretKey,
				},
			  ];

			setSending(true);
			/* send the transaction and await its confirmation */
			const confirmation = await sendAndConfirmTransaction(connection, transaction, signers);
			setTransactionSig(confirmation);
			setSending(false);

			if (network) {
				const updatedBalance = await refreshBalance(network, account);
				setBalance(updatedBalance);
				message.success(`Transaction confirmed`);
			}
		} catch (error) {
			message.error("Transaction failed, please check your inputs and try again");
			console.log(error);
		}
	};
/*************************************************************************************************/
	return (
		<>
			<CheckContainer>
				<CheckImage src="/check.jpeg" alt="Check" />
				<CheckFrom>{`FROM: ${account?.publicKey}`}</CheckFrom>

				{transactionSig && (
					<Processed
						href={`https://explorer.solana.com/tx/${transactionSig}?cluster=devnet`}
						target="_blank"
					>
						Processed - Review on Solana Block Explorer
					</Processed>
				)}

				<CheckDate>
					{new Date().toString().split(" ").slice(1, 4).join(" ")}
				</CheckDate>
				<RecipientInput
					value={form.to}
					onChange={(e) => onFieldChange("to", e.target.value)}
				/>
				<AmountInput
					value={form.amount}
					onChange={(e) => onFieldChange("amount", e.target.value)}
				/>
				<AmountText>
					{form.amount <= 0 ? "" : converter.toWords(form.amount)}
				</AmountText>
				{sending ? (
					<LoadingOutlined
						style={{
							fontSize: 24,
							position: "absolute",
							top: "69%",
							left: "73%",
						}}
						spin
					/>
				) : (
					<SignatureInput
						onClick={transfer}
						disabled={
							!balance ||
							form.amount / LAMPORTS_PER_SOL > balance ||
							!form.to ||
							form.amount == 0
						}
						type="primary"
					>
						Sign and Send
					</SignatureInput>
				)}
				<RatioText>1 $SOL = 1,000,000,000 $L</RatioText>
			</CheckContainer>
		</>
	);
};
/*************************************************************************************************/
export default TransactionModal;
/*************************************************************************************************/