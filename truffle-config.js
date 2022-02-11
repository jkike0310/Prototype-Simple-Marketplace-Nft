const HDWalletProvider = require('@truffle/hdwallet-provider');
const mnemonic = 'timber believe laugh zoo problem cinnamon setup amateur various soldier wage magic';
const privateKeyTest = '0xb1a3db11f5af168b81aca69a564c87d1eaae43e1587a6db39baa1e1e98144047';
module.exports = {
  // Uncommenting the defaults below 
  // provides for an easier quick-start with Ganache.
  // You can also follow this format for other networks;
  // see <http://truffleframework.com/docs/advanced/configuration>
  // for more details on how to specify configuration options!
  //
  //networks: {
  //  development: {
  //    host: "127.0.0.1",
  //    port: 7545,
  //    network_id: "*"
  //  },
  //  test: {
  //    host: "127.0.0.1",
  //    port: 7545,
  //    network_id: "*"
  //  }
  //},
  //  
  
  networks: {
    testnet: {
      provider: () => {
        return new HDWalletProvider({
          mnemonic,
          providerOrUrl: 'https://api.s0.b.hmny.io', // https://api.s0.t.hmny.io for mainnet
          derivationPath: `m/44'/1023'/0'/0/`
        });
      },
      network_id: 1666700000, // 1666600000 for mainnet
    },
    testnetHar: {
      provider: () => {
        if (!privateKeyTest.trim()) {
          throw new Error(
            'Please enter a private key with funds, you can use the default one'
          );
        }
        return new HDWalletProvider({
          privateKeys: [privateKeyTest],
          providerOrUrl: 'https://api.s0.b.hmny.io',
        });
      },
      network_id: 1666700000,
    },
  },
  compilers: {
    solc: {
      version: "^0.8.1"
    }
  }
};
