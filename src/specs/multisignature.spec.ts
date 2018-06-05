// Test multisig accounts

//multiple signers can be added to an account,and the signing weight can be set to require 
//multiple signatures for a transaction envelope to submit to the network

//Transactions cannot be submitted if too few signatures are provided to an envelope

//If the signing weight of the original private key (also known as the master key), is set to 0, 
//it cannot submit any operations against the account. Specifically we need to ensure this key can no longer run the following operations: 
//ALLOW TRUST, SET OPTIONS, PAYMENT, CREATE ACCOUNT