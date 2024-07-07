## Katy Perry's Hot 'N Cold!

Your hot then your cold, your yes then your no, with Katy Perry's hot'n cold you can be in then out of binary options on the temperature even when your out or down!

### Description
Puns asside, we believe that the world needs more transparency in energy markets, and that begins with the most important thing for energy companies to be concerned about --> Load.

You see, energy companies, whether they get their power from coal, gas, solar, wind, nuclear, or even hydro, need to generate an accurate forcast of the weather in order to know what resources they need to schedule and when. If those forecasts are inaccurate, they may have too much or too little load resources scheduled, causing them to have to buy or sell power in the open market. While they are plenty of instruments such as swaps, futures, forwards, and options on the price of power at a regional hub, they are few at local points of delivery. To make matters worse, within a larger region (e.g., ERCOT North), the weather can vary quite a bit within the region. This means that holding inputs to energy generation asside, the biggest financial risk to power companies is unexpected weather.

Our marketplace, powered by the Rootstock Network, enables traders to take binary bets on weather the weather will be above or below a specific price.


### How does it work?
We offer a varierty of strikes based on a fixed `temperature` which we refer to as the `strike`, using primarily farienheit as the unit of measurement.

A smart contract hosted on the rootstock network acts as an `oracle`, that keeps an up-to-date measurement of what the current temperature is. 

The `katy_perry_market` contract then connects to the oracle to validate the payout during the `evalauation_window` when the heat option is excerised. 

If the `temperature` at the time of exercise is above the oracle response, the `hots` win, otherwise the `colds` win. The payouts are distributed based on the `hots`/`colds` share of the winnings assigned to their side.


### Why is this useful / why should I care?
(1) Provides power companies direct way to hedge load variances due to weather anomolies at any arbitrary locational marginal pricing point.  
(2) By having multiple strikes, we can back out the odds, and by extension, the market implied distribution of what the temperature will be.
(3) As an extension of (2) we can derive more accurate forecasts of the weather by using the consensus of crowds rather than individual forecasters.


### Team:
(1) Ash Chary: https://github.com/ash-inthewild
(2) Mcknittrick Kaminski: https://github.com/mckamyk 
(3) Rashad Haddad: https://github.com/rashadalh

