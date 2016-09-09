import React from 'react';
import Relay from 'react-relay';
import Immutable from 'immutable';
import { Input, Button, Table } from 'react-bootstrap';

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
        this.state = {
            rsids: Immutable.OrderedMap(),
            trait: this.props.params.q,
            selectAll: false,
        };
    }
    componentWillReceiveProps(nextProps) {
        this.setState({ rsids: nextProps.rsids });
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

    render() {
        // const csv = this.state.rsids.filter((v) => v).map((v, k) => k).join('\r\n') + '\r\n';
        const nonempty = this.state.rsids.filter((v) => v).count();
        return (
            <form action={`/variables/${this.state.trait}`} method="post">
                <h2>Trait: {this.props.relay.variables.term}</h2>
                <Table>
                    <thead>
                        <tr>
                            <th>
                                <Input
                                    type="checkbox"
                                    label="Select all"
                                    ref="selectAll"
                                    checked={this.state.selectAll}
                                    onChange={this.selectAll}
                                />
                            </th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.searchQuery.results.edges.map(
                            edge => <tr key={edge.node.id}>
                                <td>
                                    <RsInput
                                        label={edge.node.SNP_ID_CURRENT}
                                        name="rsids"
                                        value={edge.node.SNP_ID_CURRENT}
                                        checked={this.state.rsids.get(edge.node.SNP_ID_CURRENT)}
                                        onChange={this.onItemChange}
                                    />
                                </td>
                                <td>Mer</td>
                            </tr>)
                        }
                    </tbody>
                </Table>
                <div>{this.props.searchQuery.count}</div>
                <Button bsStyle="primary" type="submit" download disabled={!nonempty}>Download</Button>
            </form>
        );
    }
}

export default Relay.createContainer(VariableForm, {
    initialVariables: {
        term: null,
        after: null,
    },
    fragments: {
        searchQuery: () => Relay.QL`
        fragment on SearchQuery {
            results(first:3, term: $term, after: $after)
            {
                edges {
                    node {
                        id
                        SNP_ID_CURRENT
                    }
                }
            }
            count(
                term: $term
            )
        }`,
    },
});
