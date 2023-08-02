import * as RE from '@/lib/Result';
import { useMerchantStore } from '@/stores/merchantStore';
import { DefaultLayoutContent } from '../DefaultLayoutContent';
import CollectionSetup from './CollectionSetup';
import { ManageProducts } from './ManageProducts';
import TreeSetup from './TreeSetup';

interface Props {
    className?: string;
}

export default function ProductsCard(props: Props) {
    const merchantInfo = useMerchantStore(state => state.merchantInfo);
    const getMerchantInfo = useMerchantStore(state => state.getMerchantInfo);

    console.log('merchant Info', merchantInfo);

    if (RE.isFailed(merchantInfo)) {
        return (
            <DefaultLayoutContent className={props.className}>
                <div className="flex flex-col justify-center h-full ">
                    <div className="mt-4 text-center">
                        <h1 className="text-2xl font-semibold">This Merchant does not exist</h1>
                        <p className="text-lg  mt-2">Please Log in with a different Merchant account</p>
                    </div>
                </div>
            </DefaultLayoutContent>
        );
    }

    if (RE.isOk(merchantInfo) && merchantInfo.data.loyalty.productStatus === 'tree') {
        return <TreeSetup />;
    } else if (RE.isOk(merchantInfo) && merchantInfo.data.loyalty.productStatus === 'collection') {
        return <CollectionSetup />;
    } else {
        return <ManageProducts />;
    }
}
