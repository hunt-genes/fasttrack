import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import moment from 'moment';
import React from 'react';
import Relay from 'react-relay';
import theme from '../theme';
import OrderVariablesMutation from '../mutations/orderVariables';

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
        ordered: false,
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

    onSubmitOrder = (event) => {
        event.preventDefault();
        if (this.validateEmail()) {
            this.context.relay.commitUpdate(new OrderVariablesMutation({
                email: this.state.email,
                snps: Array.from(this.state.selected),
                site: this.props.site,
            }), {
                onSuccess: () => {
                    this.setState({
                        ordered: true,
                    });
                }
            });
        }
    }

    onChangeEmail = (event, email) => {
        this.setState({ email });
        if (!this.state.emailValid) {
            this.validateEmail();
        }
    }

    onBlurEmail = () => {
        this.validateEmail();
    }

    validateEmail = () => {
        const { email } = this.state;
        let emailValid = false;
        if (email && email.match(/ntnu.no$/)) {
            emailValid = true;
        }
        else {
            emailValid = false;
        }
        this.setState({ emailValid });
        return emailValid;
    }

    onClickCancel = () => {
        this.setState({ email: '' });
        sessionStorage.setItem('orderSelected', JSON.stringify([]));
        this.context.router.goBack()
    }

    onClickBack = () => {
        this.context.router.goBack()
    }

    onClickDone = () => {
        this.setState({
            selected: new Set(),
            // ordered: false,
        });
        sessionStorage.setItem('orderSelected', JSON.stringify([]));
        const query = this.props.location.query;
        this.context.router.push({ query });
    }

    render() {
        const snps = Array.from(this.state.selected);
        snps.sort();
        return (
            <section>
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    {this.state.ordered && this.props.site.order
                        ? <div>
                            <h1>Thank you for your order</h1>
                            <p>Your order was sent {moment(this.props.site.order.createdAt).format('lll')}, and contains the following SNPs:</p>
                            <ul>
                                {this.props.site.order.snps.map(snp => <li key={snp}>{snp}</li>)}
                            </ul>
                            <p>We will send you an email to {this.props.site.order.email} when results are ready.</p>
                            <p>Please contact us if there is something wrong with your order</p>
                            <RaisedButton label="Back" onClick={this.onClickDone}/>
                        </div>
                        : <div>
                            {snps.length
                                ? <form onSubmit={this.onSubmitOrder}>
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
                    }
                </div>
            </section>
        );
    }
}

export default Relay.createContainer(Order, {
    fragments: {
        site: () => Relay.QL`
        fragment on Site {
            id
            order {
                id
                email
                snps
                createdAt
            }
            ${OrderVariablesMutation.getFragment('site')}
        }`,
        viewer: () => Relay.QL`
        fragment on User {
            id
        }`,
    },
});
