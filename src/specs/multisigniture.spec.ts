// import { expect } from 'chai'
import * as network from '../services/network'

describe.only('Multisigniture', function () {
  this.timeout(20000)

  it('Multiple signers can be added to an account, and the signing weight can be set\
   to require multiple signitures for a transaction evelope to submit to the network', async () => {
      const accountPublicKey = network.rootPublic
      const accountPrivateKey = network.rootSecret
      const signatures = [{ ed25519PublicKey: network.getNewKeypair().publicKey(), weight: 4 },
      { ed25519PublicKey: network.getNewKeypair().publicKey(), weight: 2 },
      { ed25519PublicKey: network.getNewKeypair().publicKey(), weight: 7 },
      { ed25519PublicKey: network.getNewKeypair().publicKey(), weight: 30 }]

      const setSignersToAccount = await network.setupMultiSignatureForAccount(accountPrivateKey, accountPublicKey, signatures)
      console.log(setSignersToAccount)

    })

  it('Transactions cannot be submitted if too few signatures are provided to an envelope', async () => {
    //  const accountPublicKey = network.rootPublic
    //  const accountPrivateKey = network.rootSecret
    //  const signatures = [{ ed25519PublicKey: network.getNewKeypair().publicKey(), weight: 4 },
    //  { ed25519PublicKey: network.getNewKeypair().publicKey(), weight: 2 },
    //  { ed25519PublicKey: network.getNewKeypair().publicKey(), weight: 7 },
    //  { ed25519PublicKey: network.getNewKeypair().publicKey(), weight: 30 }]

    // const setSignersToAccount = await network.setupMultiSignatureForAccount(accountPrivateKey, accountPublicKey, signatures)
    //  console.log(setSignersToAccount)

  })

  it('if the signing weight of the original private key is set to 0, it cannot submit any operations against the account', async () => {
    //  const accountPublicKey = network.rootPublic
    //  const accountPrivateKey = network.rootSecret
    //  const signatures = [{ ed25519PublicKey: network.getNewKeypair().publicKey(), weight: 4 },
    //  { ed25519PublicKey: network.getNewKeypair().publicKey(), weight: 2 },
    //  { ed25519PublicKey: network.getNewKeypair().publicKey(), weight: 7 },
    //  { ed25519PublicKey: network.getNewKeypair().publicKey(), weight: 10 }]

    //  const setSignersToAccount = await network.setupMultiSignatureForAccount(accountPrivateKey, accountPublicKey, signatures)
    //  console.log(setSignersToAccount)
  })
})
