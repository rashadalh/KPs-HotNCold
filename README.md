## Welcome to Katy Perry's Hot'n Cold Weather Prediction Market
We are a prediction for the weather, with an intent to deploy against on Rootstock Network. This will bring
the hotest weather prediction market to the coolest L2 secured by the largest and most secure blockchain.

Using the product is very simple. Simply connect your wallet, pick a city, a date, and pick whether the
high temp will be hotter or colder. At the time of maturity, our weather oracle will update with the correct
temperature, and after an arbitration period, the payout will be dispersed to the winning side. That's it!

## Instructions to run:
(Assuming you have bun and foundry installed on your system)
(1) Install dependencies -- `bun i`
(2) Start the site --> `bun dev`
(3) Start Anvil, in any new terminal window in the root dir enter --> `anvil`
(4) Take the first 5 contract addresses and type out the private key in an `.env` field
Similar to:  
```
PRIVATE_KEY="User1"
USER_1="User2"
USER_2="User3"
USER_3="User4"
USER_4="User5"
```
(Anvil automatically sets up these test accounts for you on a local rpc)
(5) Deploy contracts onto Anvil with foundry:
(5a) replace line48 in `script/DeployHeatMarket.sol` with your metamask RSK address
(5b) run the script:
`forge script --broadcast --via-ir --rpc-url http://localhost:8545 DeployHeatMarket`

(6) Go to: `http://localhost:5173/`
(7) On the website enable `local RPC`
(8) Have fun!   


## Team:
(1) McKittrick Kaminski --> https://github.com/mckamyk 
(2) Rashad Haddad --> https://github.com/rashadalh
(3) Ash-inthewild --> https://github.com/ash-inthewild 
