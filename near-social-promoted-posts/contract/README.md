# Deposit Contract

This is a smart contract built on the NEAR blockchain that allows users to make deposits and keep track of them.

## How it Works

The contract provides two main functionalities:

1. **Deposit**: Users can deposit funds to the contract by calling the `deposit` method and attaching NEAR tokens to the transaction. The method takes in a `post_id` and `expire_timestamp` as parameters, which are used to identify the deposit. The deposited amount is transferred to the contract's designated payout account.

2. **Get All Deposits**: Users can call the `get_all_deposits` method to retrieve a list of all deposits made to the contract.

## Code

The contract is implemented in Rust using the NEAR SDK. Here's an overview of the code:

- `Deposit`: A struct that represents a deposit made to the contract. It contains the `post_id`, `amount`, `timestamp`, `expire_timestamp`, and `depositor_account_id` of the deposit.

- `Contract`: The main contract struct. It contains a `payout_account` and an `all_deposits` vector. The `payout_account` specifies where deposited funds should be transferred. The `all_deposits` vector stores all deposits made to the contract.

- `deposit`: A payable method that allows users to deposit funds to the contract. It creates a new `Deposit` struct and adds it to the `all_deposits` vector. It also transfers the deposited amount to the `payout_account`.

- `get_all_deposits`: A method that retrieves all deposits made to the contract.

## Usage

To use the contract, users should deploy it to the NEAR blockchain and interact with it using a NEAR wallet or other NEAR-compatible application. They can call the `deposit` method to make a deposit and the `get_all_deposits` method to retrieve all deposits made to the contract.

For more information on how to interact with NEAR contracts, check out the NEAR documentation.
