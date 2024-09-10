# zhuxw smart contracts

This repository contains the core smart contracts for the [zhuxw](https://www.zhuxw.com/web3) website.

It includes: 
- **ZhuExchange Protocol**: A decentralized trading protocol for my weight.
- **ZHU ERC20 Token**: A fungible token following the ERC20 standard.
- **Zhuba ERC721 Token**: A non-fungible token (NFT) based on the ERC721 standard.


## Getting Started

### Prerequisites

- **Node.js**: Make sure you have Node.js installed (v14.x or later recommended).
- **npm**: Node.js package manager.
- **Hardhat**: Ethereum development environment.

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Xian-Wei/zhuxw-core.git
   cd zhuxw-core
   ```

2. **Install dependencies**: 
   ```
   npm install
   ```

3. **Running tests**: 
   ```
   npx hardhat test
   ```

4. **Deploy to a local development network**: 
   ```
   npx hardhat node
   ```

5. **Deploy to a chain**: 
   ```
   npx hardhat deploy --network ethereum
   ```

## Verifying contracts
To verify the deployed contracts on Etherscan:
   ```
   npx hardhat verify --network rinkeby DEPLOYED_CONTRACT_ADDRESS "Constructor argument 1" "Constructor argument 2"
   ```

## Configuration
Configuration files are located in:

- **hardhat.config.ts:** Main configuration file for Hardhat, including network settings.
- **helper-hardhat-config.ts:** Contains network-specific configurations such as gas prices, VRF settings, etc.

## Scripts
- **Deployment:** Scripts for deploying contracts are located in the deploy/ directory.
- **Verification:** Utilities for verifying contracts are in utils/verify.ts.

## License
This project is licensed under the MIT License.
