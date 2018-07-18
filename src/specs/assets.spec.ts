import * as network from '../services/network'
import { expect } from 'chai'
describe('asset operations', function () {
  this.timeout(30000)

  it('The balance of the custom asset has increased for the received by the amount specified in the tx', async () => {
    const issuingAccount = network.getNewKeypair()
    const issuingAccountPublic = issuingAccount.publicKey()
    const issuingAccountPrivate = issuingAccount.secret()
    const receivingAccount = network.getNewKeypair()
    const receivingAccountPublic = receivingAccount.publicKey()
    const receivingAccountPrivate = receivingAccount.secret()
    const transferAmount = 100
    const baseFee = await network.currentBaseFee()
    const assetAmount = '10'

    await network.transferFunds(
      network.rootPublic,
      [network.rootSecret],
      issuingAccountPublic,
      transferAmount,
      true
    )

    await network.transferFunds(
      network.rootPublic,
      [network.rootSecret],
      receivingAccountPublic,
      transferAmount,
      true
    )

    let accountBalanceBeforeAsset
    try {
      await network.trustAsset(issuingAccountPrivate, receivingAccountPrivate, String(baseFee))

      accountBalanceBeforeAsset = await network.getAssetBalance(receivingAccountPublic, network.BULK_GOLD)

      await network.payWithAsset(issuingAccountPrivate, receivingAccountPrivate, String(baseFee), assetAmount)

    } catch (e) {
      console.log(e)
    }

    const assetBalanceAfterTransaction = await network.getAssetBalance(receivingAccountPublic, network.BULK_GOLD)
    expect(assetBalanceAfterTransaction).to.eql(accountBalanceBeforeAsset + Number(assetAmount))
  })

  it('The fee on the payment operation of the custom asset was equal to the base fee, ie percentage fees arent applied', async () => {
    const issuingAccount = network.getNewKeypair()
    const issuingAccountPublic = issuingAccount.publicKey()
    const issuingAccountPrivate = issuingAccount.secret()
    const receivingAccount = network.getNewKeypair()
    const receivingAccountPublic = receivingAccount.publicKey()
    const receivingAccountPrivate = receivingAccount.secret()
    const transferAmount = 100
    const baseFee = await network.currentBaseFee()
    const assetAmount = '10'

    await network.transferFunds(
      network.rootPublic,
      [network.rootSecret],
      issuingAccountPublic,
      transferAmount,
      true
    )

    await network.transferFunds(
      network.rootPublic,
      [network.rootSecret],
      receivingAccountPublic,
      transferAmount,
      true
    )

    const initialBalance = await network.getAccountBalance(issuingAccountPublic)
    try {
      await network.trustAsset(issuingAccountPrivate, receivingAccountPrivate, String(baseFee))
      await network.payWithAsset(issuingAccountPrivate, receivingAccountPrivate, String(baseFee), assetAmount)

    } catch (e) {
      console.log(e)
    }

    const balanceAfterTransaction = await network.getAccountBalance(issuingAccountPublic)
    expect(balanceAfterTransaction).to.eql(initialBalance - (baseFee / 10000000))
  })
})
