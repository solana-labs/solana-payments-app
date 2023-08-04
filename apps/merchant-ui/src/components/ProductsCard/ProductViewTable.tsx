import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as RE from '@/lib/Result';
import { useLoyaltyStore } from '@/stores/merchantStore';

interface Props {
    productId: string;
}
export function ProductViewTable({ productId }: Props) {
    const loyaltyData = useLoyaltyStore(state => state.loyaltyData);

    // check if loyaltyData is Ok
    if (RE.isOk(loyaltyData) && loyaltyData.data) {
        // find the selected product
        const selectedProduct = loyaltyData.data.productNfts.productView[productId];
        console.log('selected produt', selectedProduct);

        if (selectedProduct) {
            return (
                <Table>
                    <TableCaption>{selectedProduct.productDetails.name} and their owners.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Owner Address</TableHead>
                            <TableHead>Quantity Owned</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {selectedProduct.owners.map((owner, index) => (
                            <TableRow key={index}>
                                <TableCell
                                    onClick={() =>
                                        owner.owner && window.open(`https://solscan.io/token/${owner.owner}`)
                                    }
                                    className="text-blue-400"
                                >
                                    {owner.owner}
                                </TableCell>
                                <TableCell>{owner.count}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            );
        }
    }

    return <div>No product selected or product not found.</div>;
}
