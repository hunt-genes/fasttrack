import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import React from 'react';
import Relay from 'react-relay';
import theme from '../theme';

class Order extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
        router: React.PropTypes.object.isRequired,
    }

    static childContextTypes = {
        muiTheme: React.PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    state = {
        selected: new Set(),
        email: '',
        emailValid: true,
    }

    getChildContext() {
        return { muiTheme: getMuiTheme(theme) };
    }

    componentDidMount() {
        const selected = sessionStorage.getItem('orderSelected');
        if (selected) {
            this.setState({ selected: new Set(JSON.parse(selected)) });
        }
    }

    onChangeEmail = (event, email) => {
        this.setState({ email });
    }

    onBlurEmail = () => {
        const { email } = this.props;
        if (email && email.match(/ntnu.no$/) ) {
            this.setState({ emailValid: true });
        }
        else {
            this.setState({ emailValid: false });
        }
    }

    onClickCancel = () => {
        this.setState({ email: '' });
        sessionStorage.setItem('orderSelected', JSON.stringify([]));
        this.context.router.goBack()
    }

    onClickBack = () => {
        this.context.router.goBack()
    }

    render() {
        const snps = Array.from(this.state.selected);
        snps.sort();
        return (
            <section>
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    {snps.length
                        ? <form onSubmit={this.onSubmitForm}>
                            <h1>You have selected these SNPs to order from HUNT</h1>
                            {snps.map(snp => <div key={snp}>{snp}</div>)}
                            <p>There is an amount of work related to this, so we only allow ntnu.no addresses at this time.</p>
                            <TextField
                                id="email"
                                floatingLabelText="Email"
                                type="email"
                                onChange={this.onChangeEmail}
                                onBlur={this.onBlurEmail}
                                errorText={this.state.emailValid ? '' : 'Email is not valid, is it an @ntnu.no address?'}
                            />
                            <p>Really, at this time we don't send requests at all, as this functionality is under development.</p>
                            <RaisedButton
                                primary
                                label="Send"
                                type="submit"
                            />
                            <RaisedButton
                                label="Cancel"
                                type="reset"
                                onClick={this.onClickCancel}
                            />
                        </form>
                        : <div>
                            <h1>You have selected no SNPs yet</h1>
                            <p>Please go back and select some SNPs, if you want to order variables from HUNT</p>
                            <RaisedButton
                                label="Back"
                                onClick={this.onClickBack}
                            />
                        </div>
                    }
                </div>
            </section>
        );
    }
}

export default Relay.createContainer(Order, {
    fragments: {
        viewer: () => Relay.QL`
        fragment on User {
            traits {
                id,
                uri
            }
        }`,
    },
});
