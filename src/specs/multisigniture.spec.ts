// import { expect } from 'chai'
import * as network from '../services/network'

describe('Multisigniture', function () {
  this.timeout(20000)

  it('Multiple signers can be added to an account, and the signing weight can be set\
  to require multiple signitures for a transaction evelope to submit to the network', async () => {
    const accountPrivateKey = network.rootSecret
    const accountPublicKey = network.rootPublic
    const signatures = [{ ed25519PublicKey: network.getNewKeypair().publicKey(), weight: 20 },
    { ed25519PublicKey: network.getNewKeypair().publicKey(), weight: 11 }]

    await network.setupMultiSignatureForAccount(accountPrivateKey, accountPublicKey, signatures)
    })

  it('Transactions cannot be submitted if too few signatures are provided to an envelope', async () => {
    // const accountPublicKey = network.rootPublic
    // const accountPrivateKey = network.rootSecret
  })

  it.only('if the signing weight of the original private key is set to 0, it cannot submit any operations against the account', async () => {
    const accountPrivateKey = network.rootSecret
    const accountPublicKey = network.rootPublic
    const signatures = [{ ed25519PublicKey: network.getNewKeypair().publicKey(), weight: 0 },
    { ed25519PublicKey: network.getNewKeypair().publicKey(), weight: 11 }]

    // try {
    await network.setupMultiSignatureForAccount(accountPrivateKey, accountPublicKey, signatures)
    // } catch (e) {
    //  console.log(e)
    // }
  })
})
