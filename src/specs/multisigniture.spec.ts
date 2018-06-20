// import { expect } from 'chai'
import * as network from '../services/network'

describe.only('Multisigniture', function () {
  this.timeout(20000)

  it('Multiple signers can be added to an account, and the signing weight can be set\
   to require multiple signitures for a transaction evelope to submit to the network', async () => {
    const accountPublicKey = network.rootPublic
    const accountPrivateKey = network.rootSecret
    const addSigners = await network.setupMultiSignatureForAccount(accountPrivateKey, accountPublicKey)
    console.log(addSigners)
   })

  it('Transactions cannot be submitted if too few signatures are provided to an envelope', async () => {
    // const account = network.getNewKeypair()
  })

  it('if the signing weight of the original private key is set to 0, it cannot submit any operations against the account', async () => {
    // const account = network.getNewKeypair()
  })
  })
