import { Web3ReactProvider, useWeb3React } from '@web3-react/core'
import WalletComponent from './walletComponent'

export default function Unlock({ closeModal }) {
  
  
  return (
    <div className={ classes.root }>
      <div className={ classes.closeIcon } onClick={ closeModal }><CloseIcon /></div>
      <div className={ classes.contentContainer }>
        <Web3ReactProvider getLibrary={ getLibrary }>
          <WalletComponent closeModal={ closeModal } />
        </Web3ReactProvider>
      </div>
    </div>
  )
}