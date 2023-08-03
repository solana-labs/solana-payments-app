import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import * as RE from '@/lib/Result';
import { Product, manageProducts, updateLoyalty, useMerchantStore } from '@/stores/merchantStore';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import Image from 'next/image';
import { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { Switch } from '../ui/switch';

interface Props {
    className?: string;
}

export function ManageProducts(props: Props) {
    const { toast } = useToast();

    const merchantInfo = useMerchantStore(state => state.merchantInfo);
    const getMerchantInfo = useMerchantStore(state => state.getMerchantInfo);
    const { publicKey, sendTransaction } = useWallet();
    const wallet = useWallet();
    const { connection } = useConnection();

    const products =
        RE.isOk(merchantInfo) && merchantInfo.data.loyalty.products ? merchantInfo.data.loyalty.products : [];

    const [processingId, setProcessingId] = useState<string | null>(null);

    async function handleToggle(product: Product) {
        if (!wallet) return;

        try {
            setProcessingId(product.id);
            let response;

            let data;

            if (!product.uri) {
                toast({
                    title: `About to upload and mint your unique product nft`,
                });
                response = await manageProducts({
                    id: product.id,
                    payer: publicKey?.toBase58(),
                });
                data = await response.json();
            }

            response = await updateLoyalty({
                products: {
                    id: product.id,
                    ...(data && data.uri && { uri: data.uri }),
                    active: !product.active,
                },
            });

            await getMerchantInfo();

            toast({
                title: `Successfully ${product.active ? 'deactivated' : 'activated'} NFTs`,
                variant: 'constructive',
            });
        } catch {
            toast({
                title: `Error ${product.active ? 'deactivating' : 'activating'} NFTs`,
                variant: 'destructive',
            });
        }
        setProcessingId(null);
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
                    <TableRow key={product.id} className={`h-20  `}>
                        <TableCell
                            className=""
                            // onClick={() => product.mint && window.open(`https://solscan.io/token/${product.mint}`)}
                        >
                            {product.image && <Image src={product.image} alt={product.name} width={100} height={100} />}
                        </TableCell>
                        <TableCell className="">{product.name}</TableCell>
                        <TableCell className="justify-center items-stretch">
                            {processingId === product.id ? (
                                <FaSpinner className="animate-spin h-6 w-6" />
                            ) : (
                                <Switch
                                    checked={product.active}
                                    onCheckedChange={() => handleToggle(product)}
                                    disabled={processingId !== null}
                                />
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
