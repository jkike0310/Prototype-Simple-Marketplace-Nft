const NETWORK_ID = 1666700000
const TOKEN_CONTRACT_ADDRESS = "0x944CC02Cb6aa6A05c94E1A80171aBfBF9698D632" //"0x27fc32637Cba873080F4A24fE252698708e19D0E"REMIX
const MARKETPLACE_CONTRACT_ADDRESS = "0x189Dc39e9866Ef2cF484A1dD547f8E9B2E1ea595" //"0x184d798Ca36f7A0D4100b78Db03D5A63FfFa7ABf" REMIX
const TOKEN_CONTRACT_JSON_PATH = "./abi/NftAbi.json"
const MARKETPLACE_CONTRACT_JSON_PATH = "./abi/MarketAbi.json"
var token_contract
var marketplace_contract
var accounts
var web3
var balance

function metamaskReloadCallback()
{
  window.ethereum.on('accountsChanged', (accounts) => {
    document.getElementById("web3_message").textContent="Cambio de cuenta, actualizando...";
    window.location.reload()
  })
  window.ethereum.on('networkChanged', (accounts) => {
    document.getElementById("web3_message").textContent="Cambio de red, actualizando...";
    window.location.reload()
  })
}

const getWeb3 = async () => {
  return new Promise((resolve, reject) => {
    if(document.readyState=="complete")
    {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum)
        window.location.reload()
        resolve(web3)
      } else {
        reject("must install MetaMask")
        document.getElementById("web3_message").textContent="Error: Please connect to Metamask";
      }
    }else
    {
      window.addEventListener("load", async () => {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum)
          resolve(web3)
        } else {
          reject("must install MetaMask")
          document.getElementById("web3_message").textContent="Error: Please install Metamask";
        }
      });
    }
  });
};

const getContract = async (web3, contract_json_path, contract_address) => {
  const response = await fetch(contract_json_path);
  const data = await response.json();

  const netId = await web3.eth.net.getId();
  contract = new web3.eth.Contract(
    data,
    contract_address
    );
  return contract
}

async function loadDapp() {
  metamaskReloadCallback()
  document.getElementById("web3_message").textContent="Cargando..."
  var awaitWeb3 = async function () {
    web3 = await getWeb3()
    web3.eth.net.getId((err, netId) => {
      if (netId == NETWORK_ID) {
        var awaitContract = async function () {
          token_contract = await getContract(web3, TOKEN_CONTRACT_JSON_PATH, TOKEN_CONTRACT_ADDRESS)
          marketplace_contract = await getContract(web3, MARKETPLACE_CONTRACT_JSON_PATH, MARKETPLACE_CONTRACT_ADDRESS)
          await window.ethereum.request({ method: "eth_requestAccounts" })
          accounts = await web3.eth.getAccounts()
          balance = await token_contract.methods.balanceOf(accounts[0]).call()
          for(i=0; i<balance; i++)
          {
            nft_id = await token_contract.methods.tokenOfOwnerByIndex(accounts[0],i).call()
            insertMyTokenHTML(nft_id)
          }

          my_listings_count = await marketplace_contract.methods.getListingsByOwnerCount(accounts[0]).call()
          for(i=0; i<my_listings_count; i++)
          {
            listing_id = await marketplace_contract.methods.getListingsByOwner(accounts[0], i).call()
            insertMyListingHTML(listing_id)
          }

          active_listing_count = await marketplace_contract.methods.getActiveListingsCount().call()
          for(i=0; i<active_listing_count; i++)
          {
            listing_id = await marketplace_contract.methods.getActiveListings(i).call()
            insertActiveListingHTML(listing_id)
          }

          if(balance == 1)
            document.getElementById("web3_message").textContent="Tienes 1 token"
          else
            document.getElementById("web3_message").textContent="Tienes " + balance + " tokens"
        };
        awaitContract();
      } else {
          console.log(netId);
        document.getElementById("web3_message").textContent="Conéctate a la red de Harmony (Testnet)";
      }
    });
  };
  awaitWeb3();
}

function insertMyTokenHTML(nft_id)
{
  //Token number text
  var token_element = document.createElement("p")
  token_element.innerHTML = "Token #" + nft_id
  document.getElementById("my_nfts").appendChild(token_element)

  //Approve Button
  let approve_btn = document.createElement("button")
  approve_btn.innerHTML = "Aprobar"
  document.getElementById("my_nfts").appendChild(approve_btn)
  approve_btn.onclick = function () {
    approve(MARKETPLACE_CONTRACT_ADDRESS, nft_id)
  }

  //Price
  var input = document.createElement("input")
  input.type = "text"
  input.value = "Precio"
  input.id = "price" + nft_id
  document.getElementById("my_nfts").appendChild(input)

  //Sell Button
  let mint_btn = document.createElement("button")
  mint_btn.innerHTML = "Poner en venta"
  document.getElementById("my_nfts").appendChild(mint_btn)
  mint_btn.onclick = function () {
    price = document.getElementById("price" + nft_id).value;
    addListing(nft_id, web3.utils.toWei(price))
  }
}

async function insertMyListingHTML(listing_id)
{
  listing = await marketplace_contract.methods.listings(listing_id).call()
  //Token number text
  var token_element = document.createElement("p")
  token_element.innerHTML = "Token #" + listing.token_id + " (precio: "+ web3.utils.fromWei(listing.price) +")"
  document.getElementById("my_listings").appendChild(token_element)

  //Delist Button
  let delist_btn = document.createElement("button")
  delist_btn.innerHTML = "Quitar de la venta"
  document.getElementById("my_listings").appendChild(delist_btn)
  delist_btn.onclick = function () {
    removeListing(listing_id)
  }
}

async function insertActiveListingHTML(listing_id)
{
  listing = await marketplace_contract.methods.listings(listing_id).call()
  //Token number text
  var token_element = document.createElement("p")
  token_element.innerHTML = "Token #" + listing.token_id + " (precio: "+ web3.utils.fromWei(listing.price) +")"
  document.getElementById("all_listings").appendChild(token_element)

  //Delist Button
  let delist_btn = document.createElement("button")
  delist_btn.innerHTML = "Comprar"
  document.getElementById("all_listings").appendChild(delist_btn)
  delist_btn.onclick = function () {
    buy(listing_id, listing.price)
  }
}

const mint = async () => {
  const result = await token_contract.methods.mint("https://github.com/jkike0310/NftCollectionEx/blob/main/artwork2.json")
    .send({ from: accounts[0], gas: 9000000 })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minteando...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Completado!";    })
    .catch((revertReason) => {
      console.log("ERROR! Transaction reverted: " + revertReason)
    });
}

const approve = async (contract_address, token_id) => {
  const result = await token_contract.methods.approve(contract_address, token_id)
    .send({ from: accounts[0], gas: 0 })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Aprobando...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Completado!";    })
    .catch((revertReason) => {
      console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
    });
}

const addListing = async (token_id, price) => {
  const result = await marketplace_contract.methods.addListing(token_id, price)
    .send({ from: accounts[0], gas: 0 })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Poniendo en venta...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Completado!";    })
    .catch((revertReason) => {
      console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
    });
}

const removeListing = async (listing_id) => {
  const result = await marketplace_contract.methods.removeListing(listing_id)
    .send({ from: accounts[0], gas: 0 })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Quitando del mercado...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Completado!";    })
    .catch((revertReason) => {
      console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
    });
}

const buy = async (listing_id, price) => {
  const result = await marketplace_contract.methods.buy(listing_id)
    .send({ from: accounts[0], gas: 0, value: price })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Comprando...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Completado!";    })
    .catch((revertReason) => {
      console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
    });
}
loadDapp()