import * as network from '../services/network'
import { Operation } from 'js-kinesis-sdk'
import { expect } from 'chai'

describe('Multisigniture', function () {
  this.timeout(60000)

  it(`Multiple signers can be added to an account, and a new signer can submit a transaction`, async () => {
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
      { signer: { ed25519PublicKey: signerOne.publicKey(), weight: 1 } },
      { signer: { ed25519PublicKey: signerTwo.publicKey(), weight: 1 } }
    ]

    // Add the new signers
    await network.setupMultiSignatureForAccount(masterKey.secret(), masterKey.publicKey(), signatures)

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
      { signer: { ed25519PublicKey: signerOne.publicKey(), weight: 2 } },
      { signer: { ed25519PublicKey: signerTwo.publicKey(), weight: 2 } }
    ]

    // Add the new signers
    await network.setupMultiSignatureForAccount(masterKey.secret(), masterKey.publicKey(), signatures)

    // Set the thresholds
    await network.setAccountThresholds(masterKey.secret(), masterKey.publicKey(), {
      highThreshold: 10,
      medThreshold: 3,
      lowThreshold: 1,
      masterWeight: 1
    })

    // Do a payment, signing with one of the new signers. This should fail due to lack of sigs
    try {
      await network.transferFunds(
        masterKey.publicKey(),
        [signerOne.secret()],
        network.rootPublic,
        10
      )

      throw new Error('Wrong Error')
    } catch (e) {
      expect(e.data.extras.result_codes.operations[0]).to.eql('op_bad_auth')
    }
  })

  it('Transactions can be submitted if sufficient signatures are provided to an envelope with 2 signers', async () => {
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
      { signer: { ed25519PublicKey: signerOne.publicKey(), weight: 2 } },
      { signer: { ed25519PublicKey: signerTwo.publicKey(), weight: 2 } }
    ]

    // Add the new signers
    await network.setupMultiSignatureForAccount(masterKey.secret(), masterKey.publicKey(), signatures)

    // Set the thresholds
    await network.setAccountThresholds(masterKey.secret(), masterKey.publicKey(), {
      highThreshold: 10,
      medThreshold: 3,
      lowThreshold: 1,
      masterWeight: 1
    })

    // Do a payment, signing with both signers, so it should succeed
    await network.transferFunds(
      masterKey.publicKey(),
      [signerOne.secret(), signerTwo.secret()],
      network.rootPublic,
      10
    )

    const postBalance = await network.getAccountBalance(masterKey.publicKey())
    expect(postBalance + 10 < 100).to.eql(true)
  })

  it('Transactions can be submitted if sufficient signatures are provided to an envelope with more than 2 signers', async () => {
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
    const signerThree = network.getNewKeypair()
    const signerFour = network.getNewKeypair()
    const signerFive = network.getNewKeypair()

    const signatures: Operation.SetOptionsOptions[] = [
      { signer: { ed25519PublicKey: signerOne.publicKey(), weight: 2 } },
      { signer: { ed25519PublicKey: signerTwo.publicKey(), weight: 2 } },
      { signer: { ed25519PublicKey: signerThree.publicKey(), weight: 8 } },
      { signer: { ed25519PublicKey: signerFour.publicKey(), weight: 3 } },
      { signer: { ed25519PublicKey: signerFive.publicKey(), weight: 10 } }
    ]

    // Add the new signers
    await network.setupMultiSignatureForAccount(masterKey.secret(), masterKey.publicKey(), signatures)

    // Set the thresholds
    await network.setAccountThresholds(masterKey.secret(), masterKey.publicKey(), {
      highThreshold: 50,
      medThreshold: 20,
      lowThreshold: 1,
      masterWeight: 1
    })

    // Do a payment, signing with both signers, so it should succeed
    await network.transferFunds(
      masterKey.publicKey(),
      [signerOne.secret(), signerTwo.secret(), signerThree.secret(), signerFour.secret(), signerFive.secret()],
      network.rootPublic,
      10
    )

    const postBalance = await network.getAccountBalance(masterKey.publicKey())
    expect(postBalance + 10 < 100).to.eql(true)
  })

  it('If more signers are added after the threshold is already met, the transaction fails', async () => {
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
    const signerThree = network.getNewKeypair()
    const signerFour = network.getNewKeypair()
    const signerFive = network.getNewKeypair()

    const signatures: Operation.SetOptionsOptions[] = [
      { signer: { ed25519PublicKey: signerOne.publicKey(), weight: 2 } },
      { signer: { ed25519PublicKey: signerTwo.publicKey(), weight: 2 } },
      { signer: { ed25519PublicKey: signerThree.publicKey(), weight: 8 } },
      { signer: { ed25519PublicKey: signerFour.publicKey(), weight: 10 } },
      { signer: { ed25519PublicKey: signerFive.publicKey(), weight: 12 } }
    ]

    // Add the new signers
    await network.setupMultiSignatureForAccount(masterKey.secret(), masterKey.publicKey(), signatures)

    // Set the thresholds
    await network.setAccountThresholds(masterKey.secret(), masterKey.publicKey(), {
      highThreshold: 50,
      medThreshold: 20,
      lowThreshold: 1,
      masterWeight: 1
    })

    // Do a payment, signing with both signers, so it should succeed
    try {
      await network.transferFunds(
        masterKey.publicKey(),
        [signerOne.secret(), signerTwo.secret(), signerThree.secret(), signerFour.secret(), signerFive.secret()],
        network.rootPublic,
        10
      )
      throw new Error('Wrong Error')
    } catch (e) {
      expect(e.data.extras.result_codes.transaction).to.eql('tx_bad_auth_extra')
    }
  })

  it('if the signing weight of the original private key is set to 0, it cannot submit any operations against the account', async () => {
    const masterKey = network.getNewKeypair()

    // Fund the new account
    await network.transferFunds(
      network.rootPublic,
      [network.rootSecret],
      masterKey.publicKey(),
      100,
      true
    )

    // Set the thresholds
    await network.setAccountThresholds(masterKey.secret(), masterKey.publicKey(), {
      highThreshold: 10,
      medThreshold: 1,
      lowThreshold: 1,
      masterWeight: 0
    })
    // Do a payment, signing with both signers, so it should succeed
    try {
      await network.transferFunds(
        masterKey.publicKey(),
        [masterKey.secret()],
        network.rootPublic,
        10
      )
    } catch (e) {
      expect(e.data.extras.result_codes.transaction).to.eql('tx_bad_auth')
    }
  })
})
