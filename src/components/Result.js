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
        if (number && !isNaN(number)) {
            return number.toExponential();
        }
    }
    getYear(datestring) {
        return datestring.split('-').pop();
    }

    render() {
        const result = this.props;
        const imputed = this.props.imputed;
        const genotyped = imputed && imputed.tromso.Genotyped;
        return (
            <tr className={this.rowclass(result['P-VALUE'])}>
                <td>
                    <div>
                        <Link to={`/search/?q=${result.SNP_ID_CURRENT}`}>
                            {result.SNPS}
                        </Link>
                        <div>{ genotyped ? 'Genotyped' : imputed ? 'Imputed' : '' }</div>
                    </div>
                </td>
                <td>
                    {imputed ? <ImputationResults imputed={result.imputed} /> : '' }
                </td>
                <td>
                    <div>
                        {this.exp(result['P-VALUE']) || '0.0' }
                    </div>
                    <div>
                        {result['P-VALUE (TEXT)']}
                    </div>
                </td>
                <td>
                    <div>
                        <Link to={`/search/?q=${result.REGION}`}>
                            {result.REGION}
                        </Link>
                    </div>
                    <div>
                        <Link to={result.CHR_ID ? `/search/?q=chr${result.CHR_ID}:${result.CHR_POS}` : ''}>
                            {result.CHR_ID ? `chr${result.CHR_ID}:${result.CHR_POS}` : ''}
                        </Link>
                    </div>
                    <div title={result.CONTEXT} style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {result.CONTEXT}
                    </div>
                </td>
                <td>
                    <ul>
                        {result.MAPPED_GENE.split(' - ').map(gene =>
                            <li key={gene}>
                                <Link to={`/search/q=${gene}`}>
                                    {gene}
                                </Link> <ExternalLink href={`http://www.genecards.org/cgi-bin/carddisp.pl?gene=${gene}`} />
                            </li>
                        )}
                    </ul>
                </td>
                <td>
                    <ul>
                        {result.MAPPED_TRAIT.split(', ').map(trait =>
                        <li key={trait}>
                            <Link to={`/search/?q=${trait}`}>
                                {trait}
                            </Link>
                        </li>
                        )}
                    </ul>
                </td>
                <td>
                    <div>{result['OR or BETA']}</div>
                    <div>{result['95% CI (TEXT)']}</div>
                </td>
                <td>
                    <div>{this.getYear(result.DATE)}</div>
                    <div className="uninteresting">{result['DATE ADDED TO CATALOG']}</div>
                </td>
                <td>
                    <Link to={`/search/?q=${result['FIRST AUTHOR']}`}>
                        {result['FIRST AUTHOR']}
                    </Link>
                </td>
                <td>
                    <Link to={`/search/?q=${result.PUBMEDID}`}>
                        {result.PUBMEDID}
                    </Link> <ExternalLink href={`http://www.ncbi.nlm.nih.gov/pubmed/${result.PUBMEDID}`} />
                    <div>{result.JOURNAL}</div>
                </td>
            </tr>
        );
    }
}

Result.propTypes = {
    data: React.PropTypes.object,
};

export default Result;
