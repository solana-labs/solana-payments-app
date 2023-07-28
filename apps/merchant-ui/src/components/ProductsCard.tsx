import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import * as RE from '@/lib/Result';
import { Product, updateLoyalty, useMerchantStore } from '@/stores/merchantStore';
import { Switch } from './ui/switch';

interface Props {
    className?: string;
}

export function ProductsCard(props: Props) {
    const { toast } = useToast();

    const merchantInfo = useMerchantStore(state => state.merchantInfo);
    const getMerchantInfo = useMerchantStore(state => state.getMerchantInfo);

    const products =
        RE.isOk(merchantInfo) && merchantInfo.data.loyalty.products ? merchantInfo.data.loyalty.products : [];

    async function handleToggle(product: Product) {
        try {
            await updateLoyalty({
                products: {
                    productId: product.id,
                    active: !product.active,
                },
            });

            await getMerchantInfo();

            toast({
                title: `Successfully ${product.active ? 'deactivated' : 'activated'} NFTs`,
                variant: 'constructive',
            });
        } catch (error) {
            if (error instanceof Error) {
                toast({
                    title: `Error ${product.active ? 'deactivating' : 'activating'} NFTs`,
                    description: error.message,
                    variant: 'destructive',
                });
            }
        }
    }
    return (
        <Table>
            <TableHeader>
                <TableRow className="w-full">
                    <TableHead></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>NFT Enabled</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {products.map((product: Product) => (
                    <TableRow key={product.id}>
                        <TableCell>{product.image}</TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>
                            <Switch checked={product.active} onCheckedChange={() => handleToggle(product)} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
