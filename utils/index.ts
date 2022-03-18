import { Cluster, clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { message } from "antd";
/*********************************************************************************************************/
/* *Step 3*:
 * =========
 * implement a function that gets an account's balance
 */

/*********************************************************************************************************/
/* 
 * *Step 4*: 
 * =========
 * implement a function that airdrops SOL into devnet account
 */
/*********************************************************************************************************/
const handleAirdrop = async (network: Cluster, account: Keypair | null) => {
  if (!account) return;
  try {
    /* instantiate a connection using clusterApiUrl with the active network passed in as an argument */
    const connection = new Connection(clusterApiUrl(network), "confirmed");
    const publicKey = account.publicKey;

    /* request the airdrop using the connection instance */
    const confirmation = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
    /* confirm the transaction using the connection instance and the confirmation string returned from the airdrop */
    const result = await connection.confirmTransaction(confirmation, "confirmed");
    return await refreshBalance(network, account);

  } catch (error) {
    console.log(error);
    return ;
  }
};
/*********************************************************************************************************/
const refreshBalance = async (network: Cluster , account: Keypair | null) => {
  /* make sure that the function returns before running if no account has been set */
  if (!account) return ;

  try {
    /* instantiate a connection using clusterApiUrl with the active network passed in as an argument */
    const connection = new Connection(clusterApiUrl(network), "confirmed");
    /* get the key using one of the accessors on the account passed in as an argument */
    const publicKey = account.publicKey;
    /* get the account's balance using the connection instance */
    const balance = await connection.getBalance(publicKey);
    /* This line returns the balance after the airdrop so the UI can be refreshed */
    return balance /LAMPORTS_PER_SOL;
    /* You can now delete the console.log statement since the function is implemented! */
  } catch (error) {
    console.log(error);
    return ;
  }
};
/*********************************************************************************************************/
export { refreshBalance, handleAirdrop };
