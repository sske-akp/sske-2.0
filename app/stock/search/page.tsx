import React from 'react';
import MobileSearch from '@/app/stock/search/mobile-search';
// import PcSearch from '@/app/stock/search/pc-search';

export default function StockSearch() {
    return (
        <>
            {/* <div className="block md:hidden"> */}
            <MobileSearch />
            {/* </div>

            <div className="hidden md:block">
                <PcSearch />
            </div> */}
        </>
    );
}