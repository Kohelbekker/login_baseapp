import { History } from 'history';
import { Spinner } from 'react-bootstrap';
import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { Route, Switch } from 'react-router';
import { Redirect, withRouter } from 'react-router-dom';
import { minutesUntilAutoLogout } from '../../api';
import { toggleColorTheme } from '../../helpers';
import {
    logoutFetch,
    RootState,
    selectUserFetching,
    selectUserInfo,
    selectUserLoggedIn,
    User,
    userFetch,
} from '../../modules';
import {
    EmailVerificationScreen,
    ForgotPasswordScreen,
    SignInScreen,
    SignUpScreen
} from '../../screens';

interface ReduxProps {
    colorTheme: string;
    user: User;
    isLoggedIn: boolean;
    userLoading?: boolean;
}

interface DispatchProps {
    logout: typeof logoutFetch;
    userFetch: typeof userFetch;
}

interface OwnProps {
    history: History;
}

export type LayoutProps = ReduxProps & DispatchProps & OwnProps & InjectedIntlProps;

const renderLoader = () => (
    <div className="pg-loader-container">
        <Spinner animation="border" variant="primary" />
    </div>
);

const CHECK_INTERVAL = 15000;
const STORE_KEY = 'lastAction';

//tslint:disable-next-line no-any
const PrivateRoute: React.FunctionComponent<any> = ({ component: CustomComponent, loading, isLogged, ...rest }) => {
    if (loading) {
        return renderLoader();
    }
    const renderCustomerComponent = props => <CustomComponent {...props} />;

    if (isLogged) {
        return <Route {...rest} render={renderCustomerComponent} />;
    }

    return (
        <Route {...rest}>
            <Redirect to={'/signin'} />
        </Route>
    );
};

//tslint:disable-next-line no-any
const PublicRoute: React.FunctionComponent<any> = ({ component: CustomComponent, loading, isLogged, ...rest }) => {
    if (loading) {
        return renderLoader();
    }

    if (isLogged) {
        return <Route {...rest}><Redirect to={'/wallets'} /></Route>;
    }

    const renderCustomerComponent = props => <CustomComponent {...props} />;
    return <Route {...rest} render={renderCustomerComponent} />;
};

class LayoutComponent extends React.Component<LayoutProps> {
    public static eventsListen = [
        'click',
        'keydown',
        'scroll',
        'resize',
        'mousemove',
        'TabSelect',
        'TabHide',
    ];

    public timer;
    public walletsFetchInterval;

    constructor(props: LayoutProps) {
        super(props);
        this.initListener();
    }

    public componentDidMount() {
        this.props.userFetch();
        this.initInterval();
        this.check();
    }

    public componentDidUpdate(next: LayoutProps) {
        const { isLoggedIn, history } = this.props;

        if (!isLoggedIn && next.isLoggedIn) {
            this.props.walletsReset();
            if (!history.location.pathname.includes('/trading')) {
                history.push('/trading/');
            }
        }
    }
    public componentWillUnmount() {
        for (const type of LayoutComponent.eventsListen) {
            document.body.removeEventListener(type, this.reset);
        }
        clearInterval(this.timer);
        clearInterval(this.walletsFetchInterval);
    }

    public translate = (key: string) => this.props.intl.formatMessage({id: key});

    public render() {
        const {
            colorTheme,
            isLoggedIn,
            userLoading,
        } = this.props;

        const tradingCls = window.location.pathname.includes('/trading') ? 'trading-layout' : '';
        toggleColorTheme(colorTheme);

        return (
            <div className={`container-fluid pg-layout ${tradingCls}`}>
                <Switch>
                    <PublicRoute loading={userLoading} isLogged={isLoggedIn} path="/signin" component={SignInScreen} />
                    <PublicRoute loading={userLoading} isLogged={isLoggedIn} path="/signup" component={SignUpScreen} />
                    <PublicRoute loading={userLoading} isLogged={isLoggedIn} path="/forgot_password" component={ForgotPasswordScreen} />
                    <PublicRoute loading={userLoading} isLogged={isLoggedIn} path="/email-verification" component={EmailVerificationScreen} />
                    <Route path="**"><Redirect to="/trading/" /></Route>
                </Switch>
            </div>
        );
    }

    private getLastAction = () => {
        if (localStorage.getItem(STORE_KEY) !== null) {
            return parseInt(localStorage.getItem(STORE_KEY) || '0', 10);
        }
        return 0;
    };

    private setLastAction = (lastAction: number) => {
        localStorage.setItem(STORE_KEY, lastAction.toString());
    };

    private initListener = () => {
        this.reset();
        for (const type of LayoutComponent.eventsListen) {
            document.body.addEventListener(type, this.reset);
        }
    };

    private reset = () => {
        this.setLastAction(Date.now());
    };

    private initInterval = () => {
        this.timer = setInterval(() => {
            this.check();
        }, CHECK_INTERVAL);
    };

    private check = () => {
        const { user } = this.props;
        const now = Date.now();
        const timeleft = this.getLastAction() + parseFloat(minutesUntilAutoLogout()) * 60 * 1000;
        const diff = timeleft - now;
        const isTimeout = diff < 0;
        if (isTimeout && user.email) {
            this.props.logout();
        }
    };
}

const mapStateToProps: MapStateToProps<ReduxProps, {}, RootState> = state => ({
    user: selectUserInfo(state),
    isLoggedIn: selectUserLoggedIn(state),
    userLoading: selectUserFetching(state),
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = dispatch => ({
    logout: () => dispatch(logoutFetch()),
    userFetch: () => dispatch(userFetch()),
});

// tslint:disable-next-line no-any
const Layout = injectIntl(withRouter(connect(mapStateToProps, mapDispatchToProps)(LayoutComponent) as any) as any);

export {
    Layout,
};
