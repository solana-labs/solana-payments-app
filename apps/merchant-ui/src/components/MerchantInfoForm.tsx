import { produce } from 'immer';
import { twMerge } from 'tailwind-merge';
import { AddressInput } from './AddressInput';
import { Input } from './Input';
import { Token, TokenSelect } from './TokenSelect';

export interface Data {
    name: string;
    logoSrc?: string;
    walletAddress?: string;
    token: Token;
}

interface Props {
    className?: string;
    data: Data;
    onChange?(data: Data): void;
}

export function MerchantInfoForm(props: Props) {
    return (
        <div className={twMerge('md:grid', 'md:grid-cols-[max-content,1fr]', props.className)}>
            <div className="max-w-[280px] border-gray-200 mb-9 lg:pr-8 md:pb-9 md:border-b">
                <div className="h-11">
                    <div className="text-sm font-medium text-black">Merchant Name</div>
                    <div className="text-neutral-600 text-sm">This will be displayed on your profile.</div>
                </div>
            </div>
            <div className="border-b border-gray-200 mb-9 pb-9">
                <Input
                    disabled
                    className="w-full max-w-lg"
                    value={props.data.name}
                    onChange={e => {
                        const name = e.currentTarget.value;
                        const newData = produce(props.data, data => {
                            data.name = name;
                        });
                        props.onChange?.(newData);
                    }}
                />
            </div>
            <div className="max-w-[280px] border-gray-200 pr-8 mb-9 md:pb-9 md:border-b">
                <div className="h-11">
                    <div className="text-sm font-medium text-black">Payment Receipt Address</div>
                    <div className="text-neutral-600 text-sm">Automatically receive all payments to this address</div>
                </div>
            </div>
            <div className="border-b border-gray-200 pb-9 mb-9">
                <AddressInput className="w-full max-w-lg" />
            </div>
            <div className="max-w-[280px] pr-8 mb-9 md:pb-9">
                <div className="h-11">
                    <div className="text-sm font-medium text-black">Settlement Token</div>
                    <div className="text-neutral-600 text-sm">Select which token you receive from customers</div>
                </div>
            </div>
            <div className="pb-9">
                <TokenSelect disabled token={props.data.token} className="w-full max-w-lg" />
            </div>
            {/* <div className="pr-8 pt-9 md:max-w-[280px]">
        <div className="text-sm font-medium text-black">Company Logo</div>
        <div className="text-neutral-600 text-sm">
          Update your company logo and then choose where you want it to display.
        </div>
      </div>
      <div className="grid-cols-[max-content,1fr] gap-x-8 pt-9 lg:grid">
        {props.data.logoSrc ? (
          <img className="w-36 mb-8" src={props.data.logoSrc} />
        ) : (
          <PlaceholderLogo className="w-36 mb-8" />
        )}
        <ImageUpload
          className="w-full max-w-lg"
          onChange={(imageSrc) => {
            const newData = produce(props.data, (data) => {
              data.logoSrc = imageSrc;
            });
            console.log(newData);
            props.onChange?.(newData);
          }}
        />
      </div> */}
        </div>
    );
}
