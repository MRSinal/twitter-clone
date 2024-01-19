import React, { PropsWithChildren } from 'react';

const Layout = (props: PropsWithChildren<>) => {
    return (
        <main className="flex justify-center h-screen">
            <div className="w-full h-full md:max-w-2xl border-x border-slate-400 overflow-y-scroll no-scrollbar">
                    {props.children}
            </div>
        </main>
    );
}

export default Layout;
