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

    render() {
        const result = this.props;
        const hunt = result.hunt;
        const tromso = result.tromso;
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
        return (
            <tr className={this.rowclass(result.p_value)}>
                <td>
                    <div>
                        <Link to={`/search/?q=${result.snp_id_current}`}>
                            {result.snps}
                        </Link>
                    </div>
                    <div>
                        {analysis}
                    </div>
                </td>
                <td>
                    {hunt && hunt.map(
                        data => <ImputationResults key={`${result.snp_id_current}-hunt-${data.ref}-${data.alt}`} imputation_data={data} />
                        )
                    }
                    {tromso && tromso.map(
                        data => <ImputationResults key={`${result.snp_id_current}-hunt-${data.ref}-${data.alt}`} imputation_data={data} />
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
                    <ul>
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
                    <ul>
                        {result.traits.map(trait =>
                        <li key={trait}>
                            <Link to={`/search/?q=${trait}`}>
                                {trait}
                            </Link>
                        </li>
                        )}
                    </ul>
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
};

export default Result;
