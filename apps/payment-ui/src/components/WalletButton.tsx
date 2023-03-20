import React from 'react';

const WalletButton = () => {
  return (
        <div className="dropdown dropdown-end w-full">
        <label tabIndex={0} className="btn btn-outline w-full justify-start text-black">Hr9an...1asq</label>
        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full">
            <li><a>Item 1</a></li>
            <li><a>Item 2</a></li>
        </ul>
        </div>
    );
};

export default WalletButton;
