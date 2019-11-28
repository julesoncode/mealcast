// TODO: https://medium.com/@alexmngn/how-to-better-organize-your-react-applications-2fd3ea1920f1
// TODO: https://dev.to/jessicabetts/how-to-use-google-maps-api-and-react-js-26c2

class AddressControl extends React.Component {
    constructor(props) {
        super(props)
        // since we're interacting with a non-react Google api
        // we need to use React refs to link up the underlying 
        // DOM node
        this.myRef = React.createRef();
    }


    componentDidMount() {
        // bounding box around San Francisco
        var defaultBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(37.804840, -122.539670),
            new google.maps.LatLng(37.712055, -122.3513996));

        // Google api parameters, we only want exact addresses
        var options = {
            bounds: defaultBounds,
            types: ['address']
        };

        // set up the Google autocompletion API, using our React ref we get the current DOM
        // input node and pass it to the API.
        this.autocomplete = new google.maps.places.Autocomplete(this.myRef.current, options);
        const input = this.myRef.current;

        // add a listener whenever an address is picked, we propagate this to our onAddressChanged event 
        this.autocomplete.addListener('place_changed', () => {
            const place = this.autocomplete.getPlace()
            this.props.onAddressChanged(place)
        });
    }

    render() {
        var placeholder = "Pick an address"
        if (this.props.defaultAddress !== null) {
            placeholder = this.props.defaultAddress
        }
        return <input ref={this.myRef} placeholder={placeholder} />
    }
}

AddressControl.propTypes = {
    // callback that notifies us when a new address was picked
    onAddressChanged: PropTypes.func.isRequired
};

class DateDisply extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <span>
                Date {Date.now()}
            </span>
        )
    }
}

class HourControl extends React.Component {
    constructor(props) {
        super(props)
    }

    // we need an arrow function here to bind our object to the callback
    onInputCallback = (event) => {
        // our choice list is in 30 minute intervals, so we figure out the actual
        // hour and minute values here.
        const choiceValue = event.target.value

        const hour = Math.floor(choiceValue / 2)
        const minutes = choiceValue % 2 * 30

        // report this event to our component's onStartTimeChanged callback
        this.props.onStartTimeChanged(hour, minutes)
    }

    render() {
        const d = new Date()

        // We don't care about the seconds, zero it out
        d.setSeconds(0)

        // We want the time to be broken up in 30 minute intervals:
        // 8:00..8:30..9:00..9:30........
        // To do that we check if the minute hand of the current time is
        // greater than or equal to 30. 
        // If it is, we increment the hour by 1 and set the minutes to 0
        // Otherwise we round up the minutes to 30
        // Example
        // [10:30:10:59] -> 11:00
        // [10:00..10:29] -> 10:30
        if (d.getMinutes() >= 30) {
            d.setHours(d.getHours() + 1)
            d.setMinutes(0)
        } else {
            d.setMinutes(30)
        }

        // Since we want 30 minute intervals, we multiply the current hour by 2
        var start_time = d.getHours() * 2

        // If the time is at 30 minutes we need to add 1 '30 minute interval' to the start_time
        if (d.getMinutes() == 30) {
            start_time += 1
        }

        // The end hour is 11PM, multiply it by 2 to get it in 30 minute intervals.
        const end_time = 23 * 2

        // Generate the options for the select element
        const options = Array()

        for (var i = start_time; i <= end_time; i++) {
            const current_date = new Date(d)

            // convert from '30 minute interval' to real time
            current_date.setHours(i / 2)
            current_date.setMinutes(i % 2 * 30)

            options.push((<option key={i} value={i}>{current_date.toLocaleTimeString()}</option>))
        }

        // register onInput with our callback
        return (
            <select onInput={this.onInputCallback}>
                {options}
            </select>
        )
    }
}

HourControl.propTypes = {
    // callback that notifies us when a different hour and minute has been selected
    onStartTimeChanged: PropTypes.func.isRequired
};


class MealFilters extends React.Component {
    constructor(props) {
        super(props)
        // this.props.onStartTimeChanged : callback when a time filter is changed
    }

    render() {
        return (
            <div>
                <AddressControl defaultAddress={this.props.defaultAddress}
                    onAddressChanged={this.props.onAddressChanged} />
                <DateDisply />
                <HourControl onStartTimeChanged={this.props.onStartTimeChanged} />
            </div>)
    }
}

class Meal extends React.Component {
    constructor(props) {
        super(props);
    }

    goToReservation = () => {
        window.location = '/reserve?' + $.param({
            meal_id: this.props.meal_id,
        });
    }

    render() {
        return (
            <div>
                <span>
                    ID: {this.props.meal_id}
                    Name: {this.props.name}
                </span>
                <span>
                    Pickup Time:
                    {this.props.startTime}
                </span>
                <span>
                    Distance: TODO
                </span>
                <button onClick={this.goToReservation}>
                    Reserve
                </button>
            </div>)
    }
}


MealFilters.propTypes = {
    // callback that notifies us when a different hour and minute has been selected in the filters
    onStartTimeChanged: PropTypes.func.isRequired,
    // callback that notifies us when a new address is picked
    onAddressChanged: PropTypes.func.isRequired
};


class Meals extends React.Component {
    constructor(props) {
        super(props);
        this.location = {
            address: this.props.defaultAddress,
            lat: this.props.defaultLat,
            lng: this.props.defaultLng,
        }
        this.startTime = "now"
        this.queryMeals()
        this.state = { meals: [] };
    }

    onStartTimeChangedCallback = (hour, minutes) => {
        this.startTime = { hour: hour, minutes: minutes }

        if (this.startTime !== null && this.location !== null) {
            this.queryMeals()
        }
    }

    onAddressChangedCallback = (inputAddress) => {
        this.location = {
            address: inputAddress.formatted_address,
            lat: inputAddress.geometry.location.lat,
            lng: inputAddress.geometry.location.lng,
        }

        if (this.startTime !== null && this.location !== null) {
            this.queryMeals()
        }
    }

    queryMeals() {
        const params = {
            address: this.location.address,
            lat: this.location.lat,
            lng: this.location.lng,
            startTime: this.startTime
        }
        $.getJSON("api/meals", params, (meals) => {
            this.setState({ meals: meals })
        });
    }

    render() {
        const meal_components = new Array()

        this.state.meals.forEach((meal) => {
            meal_components.push(<Meal key={meal.meal_id} meal_id={meal.meal_id} name={meal.name} startTime={meal.start_time} />)
        })

        return (
            <div>
                <MealFilters
                    defaultAddress={this.props.defaultAddress}
                    onStartTimeChanged={this.onStartTimeChangedCallback}
                    onAddressChanged={this.onAddressChangedCallback} />
                {meal_components}
            </div>)
    }
}

class LandingPage extends React.Component {
    constructor(props) {
        super(props)
        this.place = null
    }
    onAddressChangedCallback = (place) => {
        this.place = place
    }

    goToMeals = () => {
        window.location = '/meals?' + $.param({
            address: this.place.formatted_address,
            lat: this.place.geometry.location.lat,
            lng: this.place.geometry.location.lng,
        });
    }

    goToHost = () => {
        window.location = '/host';
    }

    render() {
        return (
            <div>
                <div>
                    <AddressControl onAddressChanged={this.onAddressChangedCallback} />
                </div>
                <div>
                    <button onClick={this.goToMeals}>Find a Meal</button>
                </div>
                <div>Or</div>
                <div>
                    <button onClick={this.goToHost}>Make a Meal</button>
                </div>
            </div>
        )
    }
}

class RegisterUser extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            firstName: "",
            lastName: "",
            phoneNumber: "",
            password: "",
        }
    }

    registerUser = () => {
        $.post("api/register_user", this.state, (user) => {

        })
    }

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value});
    }

    render() {
        return (
            <div>
                <div>
                    <button onClick={() => this.props.onLoginRequested()}>Login Instead</button>
                </div>
                <div>
                    <input type="text" name="firstName" placeholder="First Name" value={this.state.firstName} onChange={this.handleChange}/>
                    <input type="text" name="lastName" placeholder="Last Name" value={this.state.lastName} onChange={this.handleChange}/>
                    <input type="text" name="phoneNumber" placeholder="Phone Number" value={this.state.phoneNumber} onChange={this.handleChange}/>
                    <input type="password" name="password" placeholder="Password" value={this.state.password} onChange={this.handleChange}/>
                    <button onClick={this.registerUser}>
                        Register User
                    </button>
                </div>
            </div>
        )
    }
}

class LoginUser extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (<div>
            <div>
                    <button onClick={() => this.props.onRegisterRequested()}>Register Instead</button>
                </div>
            <div>
            <input type="text" placeholder="Email" />
            <input type="text" placeholder="Password" />
            </div>
        </div>)
    }
}

class UserInfo extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            current: "loading",
        }
        this.getLoggedInUser();
    }

    getLoggedInUser() {
        $.getJSON("api/user", null, (user) => {
            this.setState({ current: "logged-in", user: user })
        }).fail(() => {
            this.setState({ current: "unauthenticated-register" })
        });
    }

    loginRequested = () => {
        this.setState({ current: "unauthenticated-login" })
    }

    registerRequested = () => {
        this.setState({ current: "unauthenticated-register" })
    }

    render() {
        var componentToRender = null;

        if (this.state.current === "logged-in") {
            componentToRender = (<div>
                Hello User
            </div>)
        } else if (this.state.current === "unauthenticated-register") {
            componentToRender = <RegisterUser onLoginRequested={this.loginRequested} />
        } else if (this.state.current === "unauthenticated-login") {
            componentToRender = <LoginUser onRegisterRequested={this.registerRequested} />
        } else {
            // We're waiting for the ajax query to get the user so don't show anything yet
        }

        return (<div>
            {componentToRender}
        </div>)
    }
}

class Reserve extends React.Component {
    constructor(props) {
        super(props)
        this.place = null
        this.state = {
            user: null,
        }
    }

    setUser = (user) => {;
        this.setState({user: user})
    }

    render() {
        return (<div>
            <UserInfo onUserResolved={this.setUser}/>
            <div>
                <div>Meal Info</div>
                <button disabled={this.state.user === null}>Reserve</button>
            </div>
        </div>)
    }
}
