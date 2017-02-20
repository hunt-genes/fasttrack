import React from 'react';

export default class OrderSnpTable extends React.Component {
    static propTypes = {
        snps: React.PropTypes.array,
        results: React.PropTypes.array,
    }

    render() {
        const { snps, results } = this.props;
        return (
            <table>
                <thead>
                    <tr>
                        <th>SNP</th>
                        <th>Mapped genes</th>
                        <th>Mapped traits</th>
                    </tr>
                </thead>
                <tbody>
                    {snps.map((snp) => {
                        return (
                            <tr key={snp}>
                                <td>{snp}</td>
                                <td>
                                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                                        {results.get(snp).genes.map((gene) => {
                                            return <li key={gene}>{gene}</li>;
                                        })}
                                    </ul>
                                </td>
                                <td>
                                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                                        {results.get(snp).traits.map((trait) => {
                                            return <li key={trait}>{trait}</li>;
                                        })}
                                    </ul>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    }
}
