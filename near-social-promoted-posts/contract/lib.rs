use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::Vector;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{env, near_bindgen, AccountId, Balance, Promise};

const PAYOUT_ACCOUNT: &str = "devg.near";

#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct Deposit {
    pub post_id: u64,
    pub amount: Balance,
    pub timestamp: u64,
    pub expire_timestamp: u64,
    pub depositor_account_id: AccountId,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Contract {
    pub payout_account: AccountId,
    pub all_deposits: Vector<Deposit>,
}

impl Default for Contract {
    fn default() -> Self {
        Self {
            payout_account: PAYOUT_ACCOUNT.parse().unwrap(),
            all_deposits: Vector::new(b"all_deposits".to_vec()),
        }
    }
}

#[near_bindgen]
impl Contract {
    #[payable]
    pub fn deposit(&mut self, post_id: u64, expire_timestamp: u64) -> Promise {
        let attached_amount = env::attached_deposit();
        let timestamp = env::block_timestamp_ms();
        let depositor_account_id = env::predecessor_account_id();

        // Create a new deposit
        let deposit = Deposit {
            post_id,
            amount: attached_amount,
            timestamp,
            expire_timestamp,
            depositor_account_id,
        };

        // Add the deposit to the all_deposits vector
        self.all_deposits.push(&deposit);

        // Transfer the attached amount to the payout account
        Promise::new(self.payout_account.clone()).transfer(attached_amount)
    }

    pub fn get_all_deposits(&self) -> Vec<Deposit> {
        self.all_deposits.to_vec()
    }
}
