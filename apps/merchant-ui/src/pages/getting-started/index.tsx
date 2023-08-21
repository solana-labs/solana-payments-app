import { DefaultLayout } from '@/components/DefaultLayout';
import { DefaultLayoutContent } from '@/components/DefaultLayoutContent';
import { DefaultLayoutScreenTitle } from '@/components/DefaultLayoutScreenTitle';
import { FinishAccountSetupPrompt } from '@/components/FinishAccountSetupPrompt';
import { LoadingDots } from '@/components/LoadingDots';
import Merchant404 from '@/components/Merchant404';
import { isFailed, isOk, isPending } from '@/lib/Result';
import { useMerchantStore } from '@/stores/merchantStore';
import Head from 'next/head';
import Router from 'next/router';
interface Props {
    className?: string;
}

export default function GetStartedPage(props: Props) {
    const merchantInfo = useMerchantStore(state => state.merchantInfo);
    if (isFailed(merchantInfo)) {
        return <Merchant404 />;
    }

    if (isPending(merchantInfo)) {
        return (
            <div className="flex items-center justify-center h-screen">
                <LoadingDots />
            </div>
        );
    }

    if (isOk(merchantInfo) && merchantInfo.data.completed) {
        Router.push('/merchant');
    }

    return (
        <>
            <Head>
                <title>Solana Pay - Get Started</title>
                <meta name="description" content="Get Started" />
            </Head>
            <div className="h-screen w-screen">
                <DefaultLayout className="h-full w-full">
                    <DefaultLayoutContent className={props.className}>
                        <DefaultLayoutScreenTitle>Welcome, {merchantInfo.data.name}!</DefaultLayoutScreenTitle>
                        <FinishAccountSetupPrompt className="mt-6 rounded-xl" />
                    </DefaultLayoutContent>
                </DefaultLayout>
            </div>
        </>
    );
}
