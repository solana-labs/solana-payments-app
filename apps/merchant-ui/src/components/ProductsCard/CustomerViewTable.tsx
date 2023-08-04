import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { isOk } from '@/lib/Result';
import { ProductDetail, useLoyaltyStore } from '@/stores/merchantStore';
import Image from 'next/image';

export function CustomerViewTable() {
    const loyaltyData = useLoyaltyStore(state => state.loyaltyData);

    return (
        <Table>
            <TableCaption>A list of customers and their owned products.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead>Customer Address</TableHead>
                    <TableHead>NFTs Owned</TableHead>
                    <TableHead>List of NFTs</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {Object.entries(isOk(loyaltyData) && loyaltyData.data.productNfts.customerView).map(
                    ([customer, products], index) => (
                        <TableRow key={index}>
                            <TableCell
                                onClick={() => customer && window.open(`https://solscan.io/token/${customer}`)}
                                className="text-blue-400"
                            >
                                {customer}
                            </TableCell>
                            <TableCell>{products.length}</TableCell>
                            <TableCell className="flex flex-row">
                                {products.map((product: ProductDetail) => (
                                    <Image
                                        key={product.id}
                                        src={product.image}
                                        alt={product.name}
                                        width={50}
                                        height={50}
                                    />
                                ))}
                            </TableCell>
                        </TableRow>
                    )
                )}
            </TableBody>
        </Table>
    );
}
