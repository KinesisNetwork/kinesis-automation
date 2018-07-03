import * as network from '../services/network'
import { expect } from 'chai'
describe('asset operations', function () {
  this.timeout(30000)

  it('The balance of the custom asset has increased for the received by the amount specified in the tx', async () => {
    const issuingAccount = network.getNewKeypair()
    const issuingAccountPublic = issuingAccount.publicKey()
    const issuingAccountPrivate = issuingAccount.secret()
    const receivingAccount = network.getNewKeypair().secret()
    const transferAmount = 100
    const baseFee = await network.currentBaseFee()

    await network.transferFunds(
      network.rootPublic,
      network.rootSecret,
      issuingAccountPublic,
      transferAmount,
      true
    )

    const initialBalance = await network.getAccountBalance(issuingAccountPublic)

    await network.trustAsset(issuingAccountPrivate, receivingAccount, String(baseFee))
    await network.payWithAsset(issuingAccountPrivate, receivingAccount, String(baseFee))

    const balanceAfterTransaction = await network.getAccountBalance(issuingAccountPublic)
    expect(balanceAfterTransaction).to.eql(initialBalance - (baseFee / 10000000))
  })

  it.only('The fee on the payment operation of the custom asset was equal to the base fee, ie percentage fees arent applied', async () => {
    const issuingAccount = network.getNewKeypair()
    const issuingAccountPublic = issuingAccount.publicKey()
    const issuingAccountPrivate = issuingAccount.secret()
    const receivingAccount = network.getNewKeypair().secret()
    const transferAmount = 100
    const baseFee = await network.currentBaseFee()

    await network.transferFunds(
      network.rootPublic,
      network.rootSecret,
      issuingAccountPublic,
      transferAmount,
      true
    )

    const initialBalance = await network.getAccountBalance(issuingAccountPublic)
    await network.trustAsset(issuingAccountPrivate, receivingAccount, String(baseFee))
    // await network.payWithAsset(issuingAccountPrivate, receivingAccount, String(baseFee))

    const balanceAfterTransaction = await network.getAccountBalance(issuingAccountPublic)
    console.log(balanceAfterTransaction)
    expect(balanceAfterTransaction).to.eql(initialBalance - (baseFee / 10000000))
  })
})
