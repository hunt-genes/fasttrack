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
        const result = this.props.data;
        const imputed = this.props.data.get('imputed');
        const genotyped = imputed && imputed.get('tromso').get('Genotyped');
        return (
            <tr className={this.rowclass(result.get('P-VALUE'))}>
                <td>
                    <div>
                        <Link to={`/search/?q=${result.get('SNP_ID_CURRENT')}`}>
                            {result.get('SNPS')}
                        </Link>
                        <div>{ genotyped ? 'Genotyped' : imputed ? 'Imputed' : '' }</div>
                    </div>
                </td>
                <td>
                    {imputed ? <ImputationResults imputed={result.get('imputed')} /> : '' }
                </td>
                <td>
                    <div>
                        {this.exp(result.get('P-VALUE')) || '0.0' }
                    </div>
                    <div>
                        {result.get('P-VALUE (TEXT)')}
                    </div>
                </td>
                <td>
                    <div>
                        <Link to={`/search/?q=${result.get('REGION')}`}>
                            {result.get('REGION')}
                        </Link>
                    </div>
                    <div>
                        <Link to={result.get('CHR_ID') ? `/search/?q=chr${result.get('CHR_ID')}:${result.get('CHR_POS')}` : ''}>
                            {result.get('CHR_ID') ? `chr${result.get('CHR_ID')}:${result.get('CHR_POS')}` : ''}
                        </Link>
                    </div>
                    <div title={result.get('CONTEXT')} style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {result.get('CONTEXT')}
                    </div>
                </td>
                <td>
                    <ul>
                        {result.get('MAPPED_GENE').split(' - ').map(gene =>
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
                        {result.get('MAPPED_TRAIT').split(', ').map(trait =>
                        <li key={trait}>
                            <Link to={`/search/?q=${trait}`}>
                                {trait}
                            </Link>
                        </li>
                        )}
                    </ul>
                </td>
                <td>
                    <div>{result.get('OR or BETA')}</div>
                    <div>{result.get('95% CI (TEXT)')}</div>
                </td>
                <td>
                    <div>{this.getYear(result.get('DATE'))}</div>
                    <div className="uninteresting">{result.get('DATE ADDED TO CATALOG')}</div>
                </td>
                <td>
                    <Link to={`/search/?q=${result.get('FIRST AUTHOR')}`}>
                        {result.get('FIRST AUTHOR')}
                    </Link>
                </td>
                <td>
                    <Link to={`/search/?q=${result.get('PUBMEDID')}`}>
                        {result.get('PUBMEDID')}
                    </Link> <ExternalLink href={`http://www.ncbi.nlm.nih.gov/pubmed/${result.get('PUBMEDID')}`} />
                    <div>{result.get('JOURNAL')}</div>
                </td>
            </tr>
        );
    }
}

Result.propTypes = {
    data: React.PropTypes.object,
};

export default Result;
