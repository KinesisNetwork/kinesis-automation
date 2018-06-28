import * as network from '../services/network'
import { get } from 'lodash'
import { Operation } from 'js-kinesis-sdk'
import { expect } from 'chai'

describe('Multisigniture', function () {
  this.timeout(20000)

  it(`
    Multiple signers can be added to an account, and the signing weight can be set
    to require multiple signitures for a transaction evelope to submit to the network
  `, async () => {
      const masterKey = network.getNewKeypair()

      // Fund the new account
      await network.transferFunds(
        network.rootPublic,
        [network.rootSecret],
        masterKey.publicKey(),
        100,
        true
      )

      const signerOne = network.getNewKeypair()
      const signerTwo = network.getNewKeypair()

      const signatures: Operation.SetOptionsOptions[] = [
        { signer: { ed25519PublicKey: signerOne.publicKey(), weight: 100 } },
        { signer: { ed25519PublicKey: signerTwo.publicKey(), weight: 1 } }
      ]

      // Add the new signers
      try {
        await network.setupMultiSignatureForAccount(masterKey.secret(), masterKey.publicKey(), signatures)
      } catch (e) {
        const opCodeError = get(e, 'data.extras.result_codes', e.message)
        console.log(opCodeError)
      }

      // Do a payment, signing with one of the new signers
      await network.transferFunds(
        masterKey.publicKey(),
        [signerOne.secret()],
        network.rootPublic,
        10
      )

      const postBalance = await network.getAccountBalance(masterKey.publicKey())
      expect(postBalance + 10 < 100).to.eql(true)
    })

  it('Transactions cannot be submitted if too few signatures are provided to an envelope', async () => {
    // const accountPublicKey = network.rootPublic
    // const accountPrivateKey = network.rootSecret
  })

  // it('if the signing weight of the original private key is set to 0, it cannot submit any operations against the account', async () => {
  //   const accountPrivateKey = network.rootSecret
  //   const accountPublicKey = network.rootPublic
  //   const signatures = [{ ed25519PublicKey: network.getNewKeypair().publicKey(), weight: 0 },
  //   { ed25519PublicKey: network.getNewKeypair().publicKey(), weight: 11 }]

  //   // try {
  //   await network.setupMultiSignatureForAccount(accountPrivateKey, accountPublicKey, signatures)
  //   // } catch (e) {
  //   //  console.log(e)
  //   // }
  // })
})
