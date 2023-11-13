import React, { memo } from 'react';
import Escrow from './Escrow';

const History = (props) => {
    const { escrows = [], loggedInUserAddress="" } = props;

    return (
        <div id="container">
          {escrows.map((escrow) => {
            return <Escrow key={escrow.address} {...escrow} loggedInUserAddress={loggedInUserAddress}/>;
          })}
        </div>
    );
};

export default memo(History);