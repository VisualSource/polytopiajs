import React from 'react';
import BackButton from './BackButton';

export default function Menu({children, menuId, title}: {children: any, menuId: string, title: string}){
    return <div id={menuId} className="menu">
            <BackButton/>
            <h2>{title}</h2>
            {children}
           </div>
}