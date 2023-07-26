import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import * as RE from '@/lib/Result';
import { Product, useMerchantStore } from '@/stores/merchantStore';
import { Switch } from './ui/switch';

interface Props {
    className?: string;
}

export function ProductsCard(props: Props) {
    const { toast } = useToast();

    const merchantInfo = useMerchantStore(state => state.merchantInfo);

    const products =
        RE.isOk(merchantInfo) && merchantInfo.data.loyalty.products ? merchantInfo.data.loyalty.products : [];

    async function handleEnable(product: Product) {
        try {
            console.log(product);
            toast({
                title: 'Successfully enabled NFTs',
                variant: 'constructive',
            });
        } catch (error) {
            toast({
                title: 'Error enabling NFTs',
                variant: 'destructive',
            });
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
                            <Switch checked={product.active} onCheckedChange={() => handleEnable(product)} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
