import { Primary } from './Button';
import { DefaultLayoutContent } from './DefaultLayoutContent';
import { DefaultLayoutScreenTitle } from './DefaultLayoutScreenTitle';
import { FAQ } from './FAQ';

interface Props {
    className?: string;
}

export function SupportFaq(props: Props) {
    return (
        <DefaultLayoutContent className={props.className}>
            <DefaultLayoutScreenTitle>Support</DefaultLayoutScreenTitle>
            <FAQ
                className="mt-16"
                qas={[
                    {
                        question: 'What is a self-custodial wallet?',
                        answer: 'This is a device or application that stores a collection of keys and can be used to send, receive, and track ownership of cryptocurrencies. “Self-custody” simply means that you and you alone have access to the keypairs of your wallet. It is usually a wallet app on Solana, like Solflare or Phantom.',
                    },
                    {
                        question: 'What kind of wallet can I use to receive payments?',
                        answer: 'You are able to use a custodial wallet or a self-custodial wallet. One of the most common custodial wallets is a Coinbase account.',
                    },
                    {
                        question: 'Can I use a Coinbase account to receive payments?',
                        answer: 'Yes you can! Coinbase is a great option, especially for merchants who want to easily offramp to fiat.',
                    },
                    {
                        question: 'Can my settlement wallet and my refund wallet be different?',
                        answer: 'Yes, they can be different! To process refunds, you’ll be required to have a self-custodial wallet that you transact with. You will not be able to process refunds from a Coinbase account. If you are receiving funds to a Coinbase account, then you’ll just need to make sure that when you approve a refund, you are able to send the funds from a self-custodial wallet.',
                    },
                ]}
                title="FAQs"
            />
            <div className="mt-11">
                <div className="text-2xl text-black font-semibold">Need more help?</div>
                <a className="inline-block mt-7" href="mailto:commerce@solana.com">
                    <Primary>Email us</Primary>
                </a>
            </div>
        </DefaultLayoutContent>
    );
}
