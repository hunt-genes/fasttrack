import React from 'react';

class ImputationResults extends React.Component {
    static propTypes = {
        imputation_data: React.PropTypes.object,
    }
    render() {
        if (!this.props.imputation_data) {
            return <div />;
        }
        const data = this.props.imputation_data;
        let rsq = '';
        if (data.imputed) {
            rsq = data.rsq;
        }
        return (
            <div>
                {data.maf}
                <br />
                {data.ref}
                {" "}
                {data.alt}
                {" "}
                {rsq}
            </div>
        );
    }
}

export default ImputationResults;
