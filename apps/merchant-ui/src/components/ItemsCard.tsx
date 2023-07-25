import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from './ui/switch';

interface Props {
    className?: string;
}

const items = [
    {
        id: 1,
        picture: 'picture',
        name: 'name',
        enabled: false,
    },
];

export function ItemsCard(props: Props) {
    const { toast } = useToast();

    async function handleEnable(item: number) {
        try {
            console.log(item);
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
                {items.map(item => (
                    <TableRow key={item.id}>
                        <TableCell>{item.picture}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                            <Switch checked={item.enabled} onCheckedChange={() => handleEnable(item.id)} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
