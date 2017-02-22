/* eslint "class-methods-use-this": 0 */
import Checkbox from 'material-ui/Checkbox';
import React from 'react';

import ImputationResults from './ImputationResults';
import ExternalLink from './ExternalLink';
import Link from './Link';

class Result extends React.Component {
    static propTypes = {
        isSelected: React.PropTypes.func,
        selecting: React.PropTypes.bool,
        snp_id_current: React.PropTypes.string,
        toggleSelected: React.PropTypes.func,
    }

    getYear(datestring) {
        if (datestring) {
            return datestring.split('-').shift();
        }
        return datestring;
    }

    exp(number) {
        if (number && typeof number === 'string') {
            return number;
        }
        if (number && !isNaN(number)) {
            return number.toExponential();
        }
        return '';
    }

    rowclass(p) {
        if (p > 0.00000005) {
            return 'uninteresting';
        }
        return '';
    }

    toggleSelected = () => {
        this.props.toggleSelected(this.props);
    }

    isSelected = () => {
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
                        <Link to={`?q=${result.snp_id_current}`}>
                            {result.snps}
                        </Link>
                        {this.props.selecting && hunt.length // only allow to select on rows with hunt data
                            ? <Checkbox onCheck={this.toggleSelected} checked={this.isSelected()} />
                            : null
                        }
                    </div>
                </td>
                <td>
                    {hunt && hunt.map((data) => {
                        return (
                            <ImputationResults
                                key={`${result.snp_id_current}-hunt-${data.ref}-${data.alt}`}
                                imputation_data={data}
                                biobank="hunt"
                            />
                        );
                    })}
                    {tromso && tromso.map((data) => {
                        return (
                            <ImputationResults
                                key={`${result.snp_id_current}-tromso-${data.ref}-${data.alt}`}
                                imputation_data={data}
                                biobank="tromso"
                            />
                        );
                    })}
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
                        <Link to={`?q=${result.region}`}>
                            {result.region}
                        </Link>
                    </div>
                    <div>
                        <Link to={result.chr_id ? `?q=chr${result.chr_id}:${result.chr_pos}` : ''}>
                            {result.chr_id ? `chr${result.chr_id}:${result.chr_pos}` : ''}
                        </Link>
                    </div>
                    <div title={result.context} style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {result.context}
                    </div>
                </td>
                <td>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {result.genes.map((gene) => {
                            return (
                                <li key={gene}>
                                    <Link to={`?q=${gene}`}>
                                        {gene}
                                    </Link> <ExternalLink href={`http://www.genecards.org/cgi-bin/carddisp.pl?gene=${gene}`} />
                                </li>
                            );
                        })}
                    </ul>
                </td>
                <td>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {result.traits.map((trait) => {
                            return (
                                <li key={trait}>
                                    <Link to={`?q=${trait}`}>
                                        {trait}
                                    </Link>
                                </li>
                            );
                        })}
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
                    <Link to={`?q=${result.first_author}`}>
                        {result.first_author}
                    </Link>
                </td>
                <td>
                    <Link to={`?q=${result.pubmedid}`}>
                        {result.pubmedid}
                    </Link> <ExternalLink href={`http://www.ncbi.nlm.nih.gov/pubmed/${result.pubmedid}`} />
                    <div>{result.journal}</div>
                </td>
            </tr>
        );
    }
}

export default Result;
