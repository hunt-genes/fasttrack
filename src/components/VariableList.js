import React from 'react';
import TraitList from './TraitList';

class VariableList extends React.Component {
    render() {
        return (
            <div>
                <p>Choose trait to select variables for from the list below</p>
                <TraitList linkPrefix="/variables/" />
            </div>
        );
    }
}
export default VariableList;
