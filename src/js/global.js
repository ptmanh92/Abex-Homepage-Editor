import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';

const FancySwitch = (props) => {
    const [checked_state, setCheckedState] = useState(props.children.state);

    const control_switch = (e) => {
        let checked_state = e.target.checked;
        setCheckedState(checked_state);
    }

    return(
        <Form.Check 
            type="switch"
            id={`fancy_switch_${props.children.id}`}
            checked={checked_state}
            onChange={(e) => { control_switch(e) }}
        />
    )
}

export {
    FancySwitch
}