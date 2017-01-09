import Checkbox from 'material-ui/Checkbox';
import React from 'react';
import { Link } from 'react-router';

import ImputationResults from './ImputationResults';
import ExternalLink from './ExternalLink';

class Result extends React.Component {
    rowclass(p) {
        if (p > 0.00000005) {
            return 'uninteresting';
        }
    }
    exp(number) {
        if (number && typeof number === 'string') {
            return number;
        }
        if (number && !isNaN(number)) {
            return number.toExponential();
        }
    }
    getYear(datestring) {
        if (datestring) {
            return datestring.split('-').shift();
        }
        return datestring;
    }

    toggleRSID = () => {
        this.props.toggleRSID(this.props.snp_id_current);
    }

    isSelected = () => {
        console.log("checking", this.props.isSelected, this.props.snp_id_current);
        return this.props.isSelected(this.props.snp_id_current);
    }

    render() {
        const result = this.props;
        const hunt = result.hunt;
        const tromso = result.tromso;
        return (
            <tr className={this.rowclass(result.p_value)}>
                <td>
                    <div>
                        {this.props.ordering ? <Checkbox onCheck={this.toggleRSID} checked={this.isSelected()} /> : null}
                        <Link to={`/search/?q=${result.snp_id_current}`}>
                            {result.snps}
                        </Link>
                    </div>
                </td>
                <td>
                    {hunt && hunt.map(
                        data => <ImputationResults key={`${result.snp_id_current}-hunt-${data.ref}-${data.alt}`} imputation_data={data} biobank="hunt" />
                        )
                    }
                    {tromso && tromso.map(
                        data => <ImputationResults key={`${result.snp_id_current}-tromso-${data.ref}-${data.alt}`} imputation_data={data} biobank="tromso" />
                        )
                    }
                </td>
                <td>
                    <div>
                        {this.exp(result.p_value) || '0.0' }
                    </div>
                    <div>
                        {result.p_value_text}
                    </div>
                </td>
                <td>
                    <div>
                        <Link to={`/search/?q=${result.region}`}>
                            {result.region}
                        </Link>
                    </div>
                    <div>
                        <Link to={result.chr_id ? `/search/?q=chr${result.chr_id}:${result.chr_pos}` : ''}>
                            {result.chr_id ? `chr${result.chr_id}:${result.chr_pos}` : ''}
                        </Link>
                    </div>
                    <div title={result.context} style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {result.context}
                    </div>
                </td>
                <td>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {result.genes.map(gene =>
                            <li key={gene}>
                                <Link to={`/search/?q=${gene}`}>
                                    {gene}
                                </Link> <ExternalLink href={`http://www.genecards.org/cgi-bin/carddisp.pl?gene=${gene}`} />
                            </li>
                        )}
                    </ul>
                </td>
                <td>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {result.traits.map(trait =>
                        <li key={trait}>
                            <Link to={`/search/?q=${trait}`}>
                                {trait}
                            </Link>
                        </li>
                        )}
                    </ul>
                    {result.disease_trait}
                </td>
                <td>
                    <div>{result.or_or_beta}</div>
                    <div>{result.p95_ci}</div>
                </td>
                <td>
                    <div>{this.getYear(result.date)}</div>
                    <div className="uninteresting">{result.date_added_to_catalog}</div>
                </td>
                <td>
                    <Link to={`/search/?q=${result.first_author}`}>
                        {result.first_author}
                    </Link>
                </td>
                <td>
                    <Link to={`/search/?q=${result.pubmedid}`}>
                        {result.pubmedid}
                    </Link> <ExternalLink href={`http://www.ncbi.nlm.nih.gov/pubmed/${result.pubmedid}`} />
                    <div>{result.journal}</div>
                </td>
            </tr>
        );
    }
}

Result.propTypes = {
    data: React.PropTypes.object,
    ordering: React.PropTypes.bool,
    toggleRSID: React.PropTypes.func,
    isSelected: React.PropTypes.func,
};

export default Result;
