import Checkbox from 'material-ui/Checkbox';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import React from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import theme from '../theme';
import Footer from './Footer';
import SearchResults from './SearchResults';
import TraitList from './TraitList';
import Summary from './Summary';

const pageSize = 50;

class Search extends React.Component {
    static propTypes = {
        location: React.PropTypes.object,
        viewer: React.PropTypes.object,
    }

    static contextTypes = {
        relay: Relay.PropTypes.Environment,
        router: React.PropTypes.object.isRequired,
    }

    static childContextTypes = {
        muiTheme: React.PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    state = {
        term: this.props.location.query.q || '',
        loading: false,
        ordering: false,
        selected: new Set(),
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    componentDidMount() {
        this.props.relay.setVariables({
            term: this.props.location.query.q,
            unique: this.props.location.query.unique === 'true',
            hunt: this.props.location.query.hunt === 'true',
            tromso: this.props.location.query.tromso === 'true',
        });
        const selected = sessionStorage.getItem('orderSelected');
        if (selected) {
            this.setState({ selected: new Set(JSON.parse(selected)) });
            if (JSON.parse(selected).length) {
                this.setState({ ordering: true });
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        // parsing of booleans from checkboxes has gotten completely
        // impossible, so we handle them in directly in the handler function,
        // by setting both the relay variable and updating the query param.
        const location = this.props.location;
        const newLocation = nextProps.location;
        const q = location.query.q;
        const newQ = newLocation.query.q;
        if (q !== newQ) {
            this.setState({ loading: true });
            this.props.relay.setVariables({
                term: newQ || '',
            }, () => { this.setState({ loading: false }); });
            this.setState({
                term: newQ || '',
            });
        }
    }

    onSearch = (event) => {
        event.preventDefault();
        this.context.router.push({ query: { q: this.state.term } });
    }

    onClear = (event) => {
        event.preventDefault();
        this.context.router.push({ query: { q: '' } });
    }

    onChange = (event, term) => {
        this.setState({ term });
    }

    onUniqueChange = () => {
        const unique = !this.props.relay.variables.unique;
        const query = this.props.location.query;
        query.unique = unique;
        this.setState({ loading: true });
        this.context.router.push({ query });
        this.props.relay.setVariables({ unique }, () => { this.setState({ loading: false }); });
    }

    onHuntChange = () => {
        const hunt = !this.props.relay.variables.hunt;
        const query = this.props.location.query;
        query.hunt = hunt;
        this.context.router.push({ query });
        this.props.relay.setVariables({ hunt });
    }

    onTromsoChange = () => {
        const tromso = !this.props.relay.variables.tromso;
        const query = this.props.location.query;
        query.tromso = tromso;
        this.context.router.push({ query });
        this.props.relay.setVariables({ tromso });
    }

    loadMore = () => {
        const results = this.props.viewer.results;
        this.props.relay.setVariables({
            pageSize: results.edges.length + pageSize,
        });
    }

    toggleOrdering = () => {
        this.setState({ ordering: !this.state.ordering });
    }

    toggleRSID = (rsid) => {
        if (this.state.selected.has(rsid)) {
            this.setState({ selected: this.state.selected.delete(rsid) });
        }
        else {
            this.setState({ selected: this.state.selected.add(rsid) });
        }
        sessionStorage.setItem('orderSelected', JSON.stringify(this.state.selected));
    }

    isSelected = (rsid) => {
        return this.state.selected.has(rsid);
    }

    render() {
        const examples = (
            <p>
                Examples: <Link to="/search/?q=diabetes">diabetes</Link>
                , <Link to="/search/?q=rs3820706">rs3820706</Link>
                , <Link to="/search/?q=Chung S">Chung S</Link>
                , <Link to="/search/?q=2q23.3">2q23.3</Link>
                , <Link to="/search/?q=CACNB4">CACNB4</Link>
            </p>
        );
        const help = (
            <div style={{ display: 'flex' }}>
                <div style={{ flexGrow: '1' }}>
                    {examples}
                </div>
                <div id="checkboxes" style={{ display: 'flex' }}>
                    <div>
                        <Checkbox
                            label="Unique"
                            checked={this.props.relay.variables.unique}
                            onCheck={this.onUniqueChange}
                            iconStyle={{ margin: 0 }}
                            labelStyle={{ marginRight: 16 }}
                        />
                    </div>
                    <div>
                        <Checkbox
                            label="Hunt"
                            checked={this.props.relay.variables.hunt}
                            onCheck={this.onHuntChange}
                            iconStyle={{ margin: 0 }}
                            labelStyle={{ marginRight: 16 }}
                        />
                    </div>
                    <div>
                        <Checkbox
                            label="Tromsø"
                            checked={this.props.relay.variables.tromso}
                            onCheck={this.onTromsoChange}
                            iconStyle={{ margin: 0 }}
                            labelStyle={{ marginRight: 16 }}
                        />
                    </div>
                </div>
            </div>
        );
    return (
        <section>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <form onSubmit={this.onSearch} onReset={this.onClear}>
                    <div style={{ display: 'flex' }}>
                        <div style={{ margin: '0 10px' }} id="logo">
                            <img
                                src="/logo.jpg"
                                style={{ marginTop: 28, width: 50 }}
                            />
                        </div>
                        <div style={{ flexGrow: 1, margin: '0 10px' }}>
                            <h1>HUNT fast-track GWAS catalog search</h1>
                            <div style={{ display: 'flex' }}>
                                <div style={{ flexGrow: '1' }}>
                                    <TextField
                                        id="query"
                                        placeholder="Search"
                                        onChange={this.onChange}
                                        value={this.state.term}
                                        fullWidth
                                    />
                                </div>
                                <div id="buttons" style={{ flexShrink: '1' }}>
                                    <RaisedButton
                                        label="Search"
                                        primary
                                        type="submit"
                                    />
                                    <RaisedButton
                                        label="Clear"
                                        type="reset"
                                    />
                                </div>
                            </div>
                            <div>
                                {help && <div>{help}</div>}
                            </div>
                        </div>
                    </div>
                    </form>
                </div>
                <Summary
                    term={this.props.location.query.q}
                    stats={this.props.viewer.stats}
                    unique={this.props.relay.variables.unique}
                    hunt={this.props.relay.variables.hunt}
                    tromso={this.props.relay.variables.tromso}
                    loading={this.state.loading}
                    ordering={this.state.ordering}
                    toggleOrdering={this.toggleOrdering}
                />
                {this.props.location.query.q ?
                    <div>
                        <SearchResults results={this.props.viewer.results} ordering={this.state.ordering} toggleRSID={this.toggleRSID} isSelected={this.isSelected} />
                        {this.props.viewer.results.pageInfo.hasNextPage ?
                            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                                <RaisedButton onClick={this.loadMore} label="Load more" />
                            </div>
                            : null
                        }
                    </div>
                    :
                        <TraitList viewer={this.props.viewer} />
                }
                <Footer requests={this.props.viewer.requests} />
            </section>
        );
    }
}

export default Relay.createContainer(Search, {
    initialVariables: {
        term: '',
        pageSize,
        unique: false,
        tromso: false,
        hunt: false,
    },
    fragments: {
        viewer: () => Relay.QL`
        fragment on User {
            results(first: $pageSize, term: $term, unique: $unique, tromso: $tromso, hunt: $hunt)
            {
                edges {
                    node {
                        id
                        snp_id_current
                        snps
                        date
                        genes
                        traits
                        disease_trait
                        or_or_beta
                        pubmedid
                        region
                        chr_id
                        chr_pos
                        context
                        p_value
                        p_value_text
                        p95_ci
                        date_added_to_catalog
                        first_author
                        journal
                        tromso {
                            maf
                            ref
                            alt
                            rsq
                            imputed
                            genotyped
                        }
                        hunt {
                            maf
                            ref
                            alt
                            rsq
                            imputed
                            genotyped
                        }
                    }
                },
                pageInfo {
                    endCursor
                    hasNextPage
                }
            }
            stats(term: $term, tromso: $tromso, hunt: $hunt) {
                total
                unique
            }
            requests {
                total
                local
            }
            ${TraitList.getFragment('viewer')}
        }`,
    },
});
