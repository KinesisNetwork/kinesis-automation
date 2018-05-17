import * as StellarSdk from 'js-kinesis-sdk'
import { find, round } from 'lodash'

export const rootPublic = 'GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H'
export const rootSecret = 'SDHOAMBNLGCE2MV5ZKIVZAQD3VCLGP53P3OBSBI6UN5L5XZI5TKHFQL4'
export const server = new StellarSdk.Server('https://kinesis-local.abx.com')

StellarSdk.Network.use(new StellarSdk.Network('Test SDF Network ; September 2015'))

const stroopsInLumen: number = 10000000

export async function getAccountBalance(publicKey: string): Promise<number> {
  const account = await server.loadAccount(publicKey)
  const nativeBalance = find(account.balances, (balance) => balance.asset_type === 'native')
  return Number(nativeBalance.balance)
}

export async function transferFunds(sourcePublicKey: string, sourcePrivateKey: string, destinationPublicKey: string, amount: number, newAccount = false) {
  const sourceKeypair = StellarSdk.Keypair.fromSecret(sourcePrivateKey)

  const account = await server.loadAccount(sourcePublicKey)
  const requiredFee = await currentFeeInStroops(amount)

  const paymentOperation = StellarSdk.Operation.payment({
    destination: destinationPublicKey,
    asset: StellarSdk.Asset.native(),
    amount: amount.toFixed(7),
  })

  const createAccountOperation = StellarSdk.Operation.createAccount({
    destination: destinationPublicKey,
    startingBalance: amount.toFixed(7)
  })

  let transaction = new StellarSdk.TransactionBuilder(account, {fee: requiredFee})
    .addOperation(newAccount ? createAccountOperation : paymentOperation)
    .build()

  transaction.sign(sourceKeypair)

  return server.submitTransaction(transaction)
}

export async function transferFundsLowFee
(sourcePublicKey: string,
 sourcePrivateKey: string,
 destinationPublicKey: string,
 amount: number,
 newAccount = false) {
  const sourceKeypair = StellarSdk.Keypair.fromSecret(sourcePrivateKey)

  const account = await server.loadAccount(sourcePublicKey)
  const requiredFee = await currentFeeInStroops(amount)
  const paymentOperation = StellarSdk.Operation.payment({
    destination: destinationPublicKey,
    asset: StellarSdk.Asset.native(),
    amount: (amount - 10).toFixed(7),
  })

  const createAccountOperation = StellarSdk.Operation.createAccount({
    destination: destinationPublicKey,
    startingBalance: amount.toFixed(7)
  })

  let transaction = new StellarSdk.TransactionBuilder(account, {fee: (requiredFee)})
    .addOperation(newAccount ? createAccountOperation : paymentOperation)
    .build()

  transaction.sign(sourceKeypair)

  return server.submitTransaction(transaction)
}

export async function transferFundsHighFee
(sourcePublicKey: string,
 sourcePrivateKey: string,
 destinationPublicKey: string,
 amount: number,
 newAccount = false) {
  const sourceKeypair = StellarSdk.Keypair.fromSecret(sourcePrivateKey)

  const account = await server.loadAccount(sourcePublicKey)
  const requiredFee = await currentFeeInStroops(amount)
  const paymentOperation = StellarSdk.Operation.payment({
    destination: destinationPublicKey,
    asset: StellarSdk.Asset.native(),
    amount: (amount + 10).toFixed(7),
  })

  const createAccountOperation = StellarSdk.Operation.createAccount({
    destination: destinationPublicKey,
    startingBalance: amount.toFixed(7)
  })

  let transaction = new StellarSdk.TransactionBuilder(account, {fee: (requiredFee)})
    .addOperation(newAccount ? createAccountOperation : paymentOperation)
    .build()

  transaction.sign(sourceKeypair)

  return server.submitTransaction(transaction)
}

export async function getMostRecentTransaction() {
  const txs = await server.transactions().order('desc').limit(1).call()
  let tx: any = txs.records[0]

  tx.operations = (await tx.operations()).records
  return tx
}

export function getNewKeypair() {
  return StellarSdk.Keypair.random()
}

export async function currentBaseFee() {
  const mostRecentLedger = await server.ledgers().order('desc').call()
  return mostRecentLedger.records[0].base_fee_in_stroops
}

export async function currentFeeInStroops(paymentAmount: number) {
  const mostRecentLedger = await server.ledgers().order('desc').call()
  const currentTransactionPercent = (mostRecentLedger.records[0].base_percentage_fee || 0) / 10000
  const percentFee = round(paymentAmount * currentTransactionPercent, 8)
  const currentBaseFeeInStroops = await currentBaseFee()

  return String(round((percentFee * stroopsInLumen) + currentBaseFeeInStroops))
}

export async function currentFee(paymentAmount: number) {
  const stroops = await currentFeeInStroops(paymentAmount)
  return Number(stroops) / stroopsInLumen
}

export async function currentBaseFeeString() {
  const currentBaseFeeInStroops = await currentBaseFee()
  return String(currentBaseFeeInStroops)
}

export async function getInflation(sourcePublicKey: string, sourcePrivateKey: string) {
  const account = await server.loadAccount(sourcePublicKey)
  const baseFee = await currentBaseFeeString()
  const addInflation = StellarSdk.Operation.inflation({})
  const sourceKeypair = StellarSdk.Keypair.fromSecret(sourcePrivateKey)

  let transaction = new StellarSdk.TransactionBuilder(account, {fee: (baseFee)})
  .addOperation(addInflation)
  .build()

  transaction.sign(sourceKeypair)
  return server.submitTransaction(transaction)
}

export function readSdkError(e) {
  return e.data.extras.result_codes
}
