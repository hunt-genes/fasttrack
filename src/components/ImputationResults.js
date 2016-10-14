import React from 'react';

class ImputationResults extends React.Component {
    static propTypes = {
        imputation_data: React.PropTypes.object,
        biobank: React.PropTypes.string,
    }
    render() {
        if (!this.props.imputation_data) {
            return <div />;
        }
        const data = this.props.imputation_data;
        const biobankLetter = this.props.biobank && this.props.biobank[0].toUpperCase();
        let analysisLetter = '';
        let rsq = '';
        if (data.genotyped) {
            analysisLetter = 'g';
        }
        else if (data.imputed) {
            rsq = data.rsq;
            analysisLetter = 'i';
        }
        else {
            // 'Typed_Only'
            analysisLetter = 't';
        }
        return (
            <div>
                <span style={{ fontWeight: 'bold' }}>{biobankLetter}</span>
                <span style={{ fontStyle: 'italic' }}>{analysisLetter}</span>
                {" "}
                {data.maf.toPrecision(3)}
                <br />
                {data.ref}
                {" "}
                {data.alt}
                {rsq ? ` ${rsq.toPrecision(3)}` : ''}
            </div>
        );
    }
}

export default ImputationResults;
