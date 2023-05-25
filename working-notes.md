Ok so what the fuck are we doing with Transaction validation. Well there are a few things we want to know. Lets start with the goal though. So the goal is to be able to say with confidence that a transaction is related directly to a payment. We also want to know that the transaction came from us. We also want to know that it was for the correct amount and went to the right place.

There are a few things we can do here

1. Check the feepayer. We can keep track of our current and previous fee payers to make sure that a transaction is safe and paid for by one of those. That will guarentee that we signed the transaction.
2. Check specific instructions.
   2a. Send token instruction. Right now we're literally just sending USDC so finding this instruction should be pretty easy. We can then just check the usdcAmount for sure. It's hard to tie it directly to a merchant because we dont keep a historical record of their payment addresses but maybe we should? To solve for this, lets make the verify a series of steps. One of those steps could be to verify that it went to the merchant. and i can back fill this functionality later.
   2b. Create account instruction. If there is a deterministic key that is created for single use accounts, we can try to derive that again for verifying and check there. maybe unsafe idk.
   2c. For the memo and the series of accounts we add onto that, we can check specific accounts that can just be derived pubkeys. that feels safer than before. We can mark certain indexes.
   2d. We could do some kind of intent key here but idk if we need to.

3. Checking the feepayer it's should be easy but we will also need to maintain a list of previous feepayers as we change them out. Can likely keep this local without it being a bd.
4. Right now the send token instruction will be instruction n-1. Check for this. We can verify usdc amount here. We can also add a function to verify merchant address but idk how it'll work yet.

So for all of these things, it's important that i'm not just relying on a single way to verify. I want to be able to verify from

1. helius response
2. normal Transaction object
3. normal RPC response

Ok i think i could make an interface that defines a set of actions and then i could make classes that conform to that interface and accept the respective types as input either helius or web and then responds as needed

I also really want to be able to verify this stuff before i respond to a transaction request. I'm gonna switch gears there. Might take an extra day or so but it's probably worth it at the end.

I could probably just start working out of the test file and seeing if i can validate there.
