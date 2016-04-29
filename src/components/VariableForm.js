import React from "react";
import Immutable from "immutable";
import connectToStores from "alt/utils/connectToStores";
import { Input, Button, Table } from "react-bootstrap";
import GwasStore from "../stores/GwasStore";
import GwasActions from "../actions/GwasActions";

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
    static getStores() {
        return [GwasStore];
    }

    static getPropsFromStores() {
        return {
            results: GwasStore.getResults(),
            rsids: GwasStore.getRsids(),
        };
    }

    componentDidMount() {
        GwasActions.search(this.props.params.q);
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
        const csv = this.state.rsids.filter((v) => v).map((v, k) => k).join("\r\n") + "\r\n";
        const nonempty = this.state.rsids.filter((v) => v).count();
        return (
            <form action={`/variables/${this.state.trait}`} method="post">
                <h2>Trait: {this.state.trait}</h2>
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
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.rsids.keySeq().map(
                            key => <tr key={key}>
                                <td>
                                    <RsInput
                                        label={key}
                                        name="rsids"
                                        value={key}
                                        checked={this.state.rsids.get(key)}
                                        onChange={this.onItemChange}
                                    />
                                </td>
                            </tr>)
                        }
                    </tbody>
                </Table>
                <Button bsStyle="primary" type="submit" download disabled={!nonempty}>Download</Button>
            </form>
        );
    }
}

export default connectToStores(VariableForm);
