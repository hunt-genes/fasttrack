import React from 'react';

class ImputationResults extends React.Component {
    static propTypes = {
        imputation_data: React.PropTypes.object,
        biobank: React.PropTypes.string,
    }
        let analysis;
        if (
            hunt && hunt.length && hunt[0].genotyped ||
            tromso && tromso.length && tromso[0].genotyped
        ) {
            analysis = 'Genotyped';
        }
        else if (
            hunt && hunt.length && hunt[0].imputed ||
            tromso && tromso.length && tromso[0].imputed
        ) {
            analysis = 'Imputed';
        }
        else if (hunt && hunt.length || tromso && tromso.length) {
            analysis = 'Typed_Only';
        }
    render() {
        if (!this.props.imputation_data) {
            return <div />;
        }
        const data = this.props.imputation_data;
        const biobankLetter = this.props.biobank && this.props.biobank[0].toUTCString();
        let analysisLetter = '';
        let rsq = '';
        if (data.genotyped) {
            rsq = data.rsq;
            analysisLetter = 'g';
        }
        else if (data.imputed) {
            rsq = data.rsq;
            analysisLetter = 'i';
        }
        else {
            analysisLetter = 't';
        }
        return (
            <div>
                <span style={{ fontWeight: 'bold' }}>{biobankLetter}</span>
                <span style={{ fontStyle: 'italic' }}>{analysisLetter}</span>
                {" "}
                {data.maf}
                <br />
                {data.ref}
                {" "}
                {data.alt}
                {rsq ? ` ${rsq}` : ''}
            </div>
        );
    }
}

export default ImputationResults;
