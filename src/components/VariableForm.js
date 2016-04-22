import React from "react";
import Immutable from "immutable";
import connectToStores from "alt/utils/connectToStores";
import { Input, Button, Table, Alert, Grid, Row, Col, Image, PageHeader } from "react-bootstrap";
import TraitList from "./TraitList";
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
        this.state = {
            rsids: Immutable.OrderedMap(),
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

    render() {
        const csv = this.state.rsids.filter((v) => v).map((v, k) => k).join("\r\n") + "\r\n";
        const encoded_data = encodeURIComponent(csv);
        return (
            <form action="/variables" method="post">
                {this.state.rsids.keySeq().map(key => <RsInput
                    key={key}
                    label={key}
                    checked={this.state.rsids.get(key)}
                    onChange={this.onItemChange}
                />)}
                <Button bsSize="small" href={`data:text/csv;charset=utf-8,${encoded_data}`} download="variables.csv">Generate list (.csv)</Button>
            </form>
        );
    }
}

export default connectToStores(VariableForm);
