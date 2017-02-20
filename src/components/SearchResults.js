import React from 'react';
import Result from './Result';

export default class SearchResults extends React.Component {
    static propTypes = {
        results: React.PropTypes.object,
        toggleSelected: React.PropTypes.func,
        isSelected: React.PropTypes.func.isRequired,
        selecting: React.PropTypes.bool,
    }

    render() {
        return (
            <table>
                <thead>
                    <tr>
                        <th>SNP</th>
                        <th>MAF</th>
                        <th><i>P</i></th>
                        <th>Position</th>
                        <th>Mapped gene</th>
                        <th>Mapped trait</th>
                        <th>OR or Beta</th>
                        <th>Year</th>
                        <th>First author</th>
                        <th>Pubmed</th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.results.edges.map((edge) => {
                        return (
                            <Result
                                key={edge.node.id}
                                selecting={this.props.selecting}
                                toggleSelected={this.props.toggleSelected}
                                isSelected={this.props.isSelected}
                                {...edge.node}
                            />
                        );
                    })}
                </tbody>
            </table>
        );
    }
}
