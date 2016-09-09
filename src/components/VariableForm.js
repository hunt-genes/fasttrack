import React from 'react';
import Relay from 'react-relay';
import { Input, Button, Table } from 'react-bootstrap';

const pageSize = 3;

class RsInput extends React.Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }
    onChange() {
        this.props.onChange(this.props.label);
    }
    render() {
        return (
            <Input
                type="checkbox"
                label={this.props.label}
                name={this.props.name}
                value={this.props.value}
                checked={this.props.checked}
                onChange={this.onChange}
            />
        );
    }
}

class VariableForm extends React.Component {
    static propTypes = {
        results: React.PropTypes.array,
    }

    static contextTypes = {
        relay: Relay.PropTypes.Environtment,
    };

    constructor(props) {
        super(props);
        this.onItemChange = this.onItemChange.bind(this);
        this.selectAll = this.selectAll.bind(this);
        this.loadMore = this.loadMore.bind(this);
    }

    onItemChange(rsid) {
        this.setState({ rsids: this.state.rsids.set(rsid, !this.state.rsids.get(rsid)) });
    }

    selectAll() {
        this.setState({
            selectAll: !this.state.selectAll,
            rsids: this.state.rsids.map((value) => !this.state.selectAll),
        });
    }

    loadMore() {
        const results = this.props.viewer.results;
        this.props.relay.setVariables({
            pageSize: results.edges.length + pageSize,
        });
    }

    render() {
        const results = this.props.viewer.results;
        return (
            <form action={`/variables/${this.props.relay.variables.term}`} method="post">
                <h2>Trait: {this.props.relay.variables.term}</h2>
                <Table>
                    <thead>
                        <tr>
                            <th>
                                <Input
                                    type="checkbox"
                                    label="Select all"
                                    ref="selectAll"
                                    onChange={this.selectAll}
                                />
                            </th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.edges.map(
                            edge => <tr key={edge.node.id}>
                                <td>
                                    <RsInput
                                        label={edge.node.SNP_ID_CURRENT}
                                        name="rsids"
                                        value={edge.node.SNP_ID_CURRENT}
                                        onChange={this.onItemChange}
                                    />
                                </td>
                                <td>Mer</td>
                            </tr>)
                        }
                    </tbody>
                </Table>
                <div>{this.props.viewer.count}</div>
                {results.pageInfo.hasNextPage ? <Button onClick={this.loadMore}>More</Button> : null }
            </form>
        );
    }
}

export default Relay.createContainer(VariableForm, {
    initialVariables: {
        term: null,
        pageSize,
    },
    fragments: {
        viewer: () => Relay.QL`
        fragment on User {
            results(first: $pageSize, term: $term)
            {
                edges {
                    node {
                        id
                        SNP_ID_CURRENT
                    }
                },
                pageInfo {
                    endCursor
                    hasNextPage
                }
            }
            count(
                term: $term
            )
        }`,
    },
});
