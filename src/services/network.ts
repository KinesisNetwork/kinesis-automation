import * as StellarSdk from 'js-kinesis-sdk'
import { find } from 'lodash'

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

export async function transferFunds(
  masterPublicKey: string,
  signingPrivateKeys: string[],
  destinationPublicKey: string,
  amount: number,
  newAccount = false,
  fee?: number
) {
  const account = await server.loadAccount(masterPublicKey)

  if (!fee) {
    fee = await currentFeeInStroops(amount)
  }

  const paymentOperation = StellarSdk.Operation.payment({
    destination: destinationPublicKey,
    asset: StellarSdk.Asset.native(),
    amount: amount.toFixed(7),
  })

  const createAccountOperation = StellarSdk.Operation.createAccount({
    destination: destinationPublicKey,
    startingBalance: amount.toFixed(7)
  })

  let transaction = new StellarSdk.TransactionBuilder(account, { fee: (fee).toString() })
    .addOperation(newAccount ? createAccountOperation : paymentOperation)
    .build()

  signingPrivateKeys.forEach(signersPrivateKey => {
    const signingKeypair = StellarSdk.Keypair.fromSecret(signersPrivateKey)
    transaction.sign(signingKeypair)
  })

  const receipt = await server.submitTransaction(transaction)
  return waitForTransaction(receipt.hash)
}

async function waitForTransaction(
  transactionId: string,
  counter: number = 0,
  results: boolean[] = [false, false, false]
): Promise<StellarSdk.TransactionRecord> {
  // Know that there are three nodes for propagation
  // Need to wait for each node to have the transaction
  counter += 1
  try {
    const successfulTransaction = await getTransaction(transactionId)
    const nodeIndex = counter % 3
    results[nodeIndex] = true
    if (results.every((result) => result)) {
      return successfulTransaction
    } else {
      return waitForTransaction(transactionId, counter, results)
    }
  } catch (e) {
    return waitForTransaction(transactionId, counter, results)
  }
}

export async function transferFundsToMultipleAccount(
  masterPublicKey: string,
  signersPrivateKey: string,
  destinationPublicKey: string[],
  amount: number,
  newAccount = false,
  fee?: number
) {
  const signingKeypair = StellarSdk.Keypair.fromSecret(signersPrivateKey)

  const account = await server.loadAccount(masterPublicKey)

  if (!fee) {
    fee = await currentFeeInStroopsMultiOperations(amount, destinationPublicKey)
  }

  const operations = destinationPublicKey.map((value) => {
    const paymentOperation = StellarSdk.Operation.payment({
      destination: value,
      asset: StellarSdk.Asset.native(),
      amount: amount.toFixed(7)
    })
    const createAccountOperation = StellarSdk.Operation.createAccount({
      destination: value,
      startingBalance: amount.toFixed(7)
    })
    return newAccount ? createAccountOperation : paymentOperation
  })

  let transaction = new StellarSdk.TransactionBuilder(account, { fee: String(fee) })

  for (let Operation of operations) {
    transaction.addOperation(Operation)
  }
  let buildTransaction = transaction.build()
  buildTransaction.sign(signingKeypair)
  return server.submitTransaction(buildTransaction)
}

export async function getMostRecentTransactions(limit = 1): Promise<any[]> {
  const txs = await server.transactions().order('desc').limit(limit).call()
  let txRecords: any[] = txs.records

  for (let i in txRecords) {
    if (txRecords[i]) {
      const tx = txRecords[i]
      tx.operations = (await tx.operations()).records
    }
  }

  return txRecords
}

export async function getTransaction(TransactionId: string) {
  const tx: StellarSdk.TransactionRecord = await server.transactions().transaction(TransactionId).call() as any
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
  const currentTransactionPercent = (mostRecentLedger.records[0].base_percentage_fee || 0)
  const percentFee = paymentAmount / 10000 * currentTransactionPercent
  const currentBaseFeeInStroops = await currentBaseFee()

  return percentFee * stroopsInLumen + currentBaseFeeInStroops
}

export async function currentFeeInStroopsMultiOperations(paymentAmount: number, destinationAccounts: string[]) {
  const numberOfBaseFeesToApply = destinationAccounts.length
  const mostRecentLedger = await server.ledgers().order('desc').call()
  const currentTransactionPercent = (mostRecentLedger.records[0].base_percentage_fee || 0)
  const percentFee = paymentAmount / 10000 * currentTransactionPercent
  const currentBaseFeeInStroops = await currentBaseFee()
  const allBaseFeesInStroops = currentBaseFeeInStroops * numberOfBaseFeesToApply

  return (percentFee * numberOfBaseFeesToApply) * stroopsInLumen + allBaseFeesInStroops
}

export async function currentFeeMultiOp(paymentAmount: number, destinationAccount: string[]) {
  const fee = await currentFeeInStroopsMultiOperations(paymentAmount, destinationAccount)
  return fee / stroopsInLumen
}

export async function currentFee(paymentAmount: number) {
  const fee = await currentFeeInStroops(paymentAmount)
  return fee / stroopsInLumen
}

export async function currentBaseFeeString() {
  const currentBaseFeeInStroops = await currentBaseFee()
  return String(currentBaseFeeInStroops)
}

export async function processInflation(masterPublicKey: string, signersPrivateKey: string, fee: string) {
  const account = await server.loadAccount(masterPublicKey)
  const addInflation = StellarSdk.Operation.inflation({})
  const signingKeypair = StellarSdk.Keypair.fromSecret(signersPrivateKey)

  let transaction = new StellarSdk.TransactionBuilder(account, { fee })
    .addOperation(addInflation)
    .build()

  transaction.sign(signingKeypair)
  return server.submitTransaction(transaction)
}

export async function mergeAccount(masterPublicKey: string, signersPrivateKey: string, destinationKeypair: string, fee: string) {
  const account = await server.loadAccount(masterPublicKey)
  const mergeAccountOperation = StellarSdk.Operation.accountMerge({ destination: destinationKeypair })

  const signingKeypair = StellarSdk.Keypair.fromSecret(signersPrivateKey)

  let transaction = new StellarSdk.TransactionBuilder(account, { fee })
    .addOperation(mergeAccountOperation)
    .build()

  transaction.sign(signingKeypair)
  return server.submitTransaction(transaction)
}

export function readSdkError(e) {
  return e.data.extras.result_codes
}

export interface MultiSigOptions {
  signers: StellarSdk.Operation.SetOptionsOptions[]
  thresholdWeights: StellarSdk.Operation.SetOptionsOptions
}

export interface MultiSigOptions {
  signers: StellarSdk.Operation.SetOptionsOptions[]
  thresholdWeights: StellarSdk.Operation.SetOptionsOptions
}

export async function setupMultiSignatureForAccount(
  signersPrivateKey: string,
  masterPublicKey: string,
  signaturesList: StellarSdk.Operation.SetOptionsOptions[]): Promise<void> {
  const signingKeypair = StellarSdk.Keypair.fromSecret(signersPrivateKey)
  const accountToAddMultiSig = await server.loadAccount(masterPublicKey)
  const baseFee = (await currentBaseFee()) * signaturesList.length

  const transaction = new StellarSdk.TransactionBuilder(accountToAddMultiSig, { fee: String(baseFee) })

  for (let signer of signaturesList) {
    transaction.addOperation(StellarSdk.Operation.setOptions(signer))
  }

  const envelope = transaction.build()
  envelope.sign(signingKeypair)

  return server.submitTransaction(envelope)
}

export async function setAccountThresholds(
  signersPrivateKey: string,
  masterPublicKey: string,
  thresholdWeights: {
    highThreshold: number,
    medThreshold: number,
    lowThreshold: number,
    masterWeight: number
  }
): Promise<void> {

  const signingKeypair = StellarSdk.Keypair.fromSecret(signersPrivateKey)
  const accountForWeights = await server.loadAccount(masterPublicKey)
  const baseFee = await currentBaseFeeString()

  const transaction = new StellarSdk.TransactionBuilder(accountForWeights, { fee: baseFee })

  transaction.addOperation(StellarSdk.Operation.setOptions(thresholdWeights))

  const envelope = transaction.build()
  envelope.sign(signingKeypair)

  return server.submitTransaction(envelope)
}
