import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Edit from '@carbon/icons-react/lib/Edit';
import { Button } from './ui/button';

interface Props {
    className?: string;
}

const tiers = [
    {
        tier: 1,
        threshold: 100,
        back: 1,
    },
    {
        tier: 2,
        threshold: 200,
        back: 2,
    },
];

export function TiersCard(props: Props) {
    async function handleEdit(tier: number) {
        console.log(tier);
    }
    return (
        <Table>
            <TableHeader>
                <TableRow className="w-full">
                    <TableHead>Tier</TableHead>
                    <TableHead>$ Threshold</TableHead>
                    <TableHead>% Back</TableHead>
                    <TableHead></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {tiers.map(tier => (
                    <TableRow key={tier.tier}>
                        <TableCell>{tier.tier}</TableCell>
                        <TableCell>{tier.threshold}</TableCell>
                        <TableCell>{tier.back}</TableCell>
                        <TableCell>
                            <Button variant="outline" onClick={() => handleEdit(tier.tier)}>
                                <Edit />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
