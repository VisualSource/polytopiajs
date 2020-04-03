import React from 'react';
import {Button} from 'shineout';

function BackButton(){
    return <Button onClick={()=>window.history.back()} type="primary">{"<"}</Button>
}
export default BackButton;