import React from 'react';
import {Image} from 'shineout';

export default function IconButton({width=50,height=50,title="icon",src,text, onClick}:{
    width?:string | number | undefined, 
    height?: string | number | undefined, 
    title?: string, 
    src: string, 
    text?: string,
    onClick?: ((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void) | undefined;
}){
    return <div className="so-button" role="button" onClick={onClick}>
            <Image width={width} height={height} shape="circle" title={title} src={src} />
            <p>{text}</p>
           </div> 
}