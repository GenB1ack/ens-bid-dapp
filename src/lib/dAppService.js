const Web3 = require('web3');
const web3 = new Web3();
const Tx = require('ethereumjs-tx');
const ENS = require('ethereum-ens');

const setWeb3Provider = () => {
  const API_KEY = process.env.INFURA_API_KEY; //TODO: should check if is empty string
  console.log(``)
  const provider = `https://ropsten.infura.io/${API_KEY}`;
  web3.setProvider(new web3.providers.HttpProvider(provider));
};

setWeb3Provider();

export const getBlockNumber = () => web3.eth.blockNumber;

export const getAddressBalanceLoad = address => {
  return web3.fromWei(web3.eth.getBalance(address), 'ether').toString(10);
};

export const sendRawTransaction = payload => {
  const {privateKey, from, to, value, data} = payload;

  const hexPivateKey = new Buffer(privateKey, 'hex');

  const rawTx = {
    // 交易的編號的 Primary Key，呼叫的時候會自動轉成 AUTO_INFREMANT
    nonce: '0x' + web3.eth.getTransactionCount(from).toString(16),  
    // 目前 Ethereum 網路的價格
    gasPrice: web3.eth.gasPrice, 
    // sender
    from,
    // receiver
    to, 
    // 多少以太幣，以 wei 為單位
    value, 
    // 打 contract 的時候需要認的 function call bytecode，或者 direct message
    data
  };

  // 偵測要花多少 gas 才可以將 transaction 送出
  rawTx.gasLimit = web3.eth.estimateGas(rawTx);
  
  const tx = new Tx(rawTx);
  tx.sign(hexPivateKey);

  const serializedTx = tx.serialize();
  
  web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), (err, hash) => {
    if (!err)
      console.log(`transactionHash: ${hash}`); // TODO listen transactionReceipt
    else 
      console.log(`err: ${err}`);
  });
};
// module.exports.sendRawTransaction = sendRawTransaction;

export const getEstimateGas = payload => {
  const {from, to, value, data} = payload;
  return web3.eth.estimateGas({ from, to, value, data });
};

export const searchAddress = async (address) => {
  try {
    const ens = new ENS(web3);
    const addr = await ens.resolver(address).addr();
    console.log(`[${address}] addr: ${addr}`);
  } catch(error) {
    console.log(`[${address}] ENS name not found or unavailable: ${error}`);
  }
}