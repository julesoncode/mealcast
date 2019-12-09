// TODO: https://medium.com/@alexmngn/how-to-better-organize-your-react-applications-2fd3ea1920f1
// TODO: https://dev.to/jessicabetts/how-to-use-google-maps-api-and-react-js-26c2

// Displays a google map view for a location passed in as a `location` prop
class GoogleMap extends React.Component {
  constructor(props) {
    super(props);
    // since we're interacting with a non-react Google api
    // we need to use React refs to link up the underlying
    // DOM node
    this.myRef = React.createRef();
  }

  componentDidMount() {
    const map = new google.maps.Map(this.myRef.current, {
      zoom: 15,
      center: this.props.location,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false
    });
    var marker = new google.maps.Marker({
      position: this.props.location,
      map: map
    });
  }

  render() {
    return <div ref={this.myRef} className="w-100 mc-google-map" />;
  }
}

class AddressControl extends React.Component {
  constructor(props) {
    super(props);
    // since we're interacting with a non-react Google api
    // we need to use React refs to link up the underlying
    // DOM node
    this.myRef = React.createRef();
  }

  componentDidMount() {
    // bounding box around San Francisco
    var defaultBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(37.80484, -122.53967),
      new google.maps.LatLng(37.712055, -122.3513996)
    );

    // Google api parameters, we only want exact addresses
    var options = {
      bounds: defaultBounds,
      types: ["address"]
    };

    // set up the Google autocompletion API, using our React ref we get the current DOM
    // input node and pass it to the API.
    this.autocomplete = new google.maps.places.Autocomplete(
      this.myRef.current,
      options
    );
    const input = this.myRef.current;

    // add a listener whenever an address is picked, we propagate this to our onAddressChanged event
    this.autocomplete.addListener("place_changed", () => {
      const place = this.autocomplete.getPlace();
      this.props.onAddressChanged(place);
    });
  }

  render() {
    var placeholder = "Pick an address";
    if (this.props.defaultAddress !== null) {
      placeholder = this.props.defaultAddress;
    }
    return (
      <input
        className={this.props.className}
        ref={this.myRef}
        placeholder={placeholder}
      />
    );
  }
}

// TODO style this better
class DateDisply extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={"input-group " + this.props.className}>
        <div className="input-group-prepend">
          <span className="input-group-text">When</span>
        </div>
        <span className="form-control">Today</span>
      </div>
    );
    // TODO expand on broader date filtering
    // return <span>Date {Date.now()}</span>;
  }
}

// Create a drop down box of times in 30 minute intervals
// has `onStartTimeChanged` event which is a function that
// has a hour and minute argument
class HourControl extends React.Component {
  constructor(props) {
    super(props);
  }

  onInputCallback = event => {
    // our choice list is in 30 minute intervals, so we figure out the actual
    // hour and minute values here.
    const choiceValue = event.target.value;

    const hour = Math.floor(choiceValue / 2);
    const minutes = (choiceValue % 2) * 30;

    // report this event to our component's onStartTimeChanged callback
    this.props.onStartTimeChanged(hour, minutes);
  };

  render() {
    const d = new Date();

    // We don't care about the seconds, zero it out
    d.setSeconds(0);

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
      d.setHours(d.getHours() + 1);
      d.setMinutes(0);
    } else {
      d.setMinutes(30);
    }

    // Since we want 30 minute intervals, we multiply the current hour by 2
    var start_time = d.getHours() * 2;

    // If the time is at 30 minutes we need to add 1 '30 minute interval' to the start_time
    if (d.getMinutes() == 30) {
      start_time += 1;
    }

    // The end hour is 11PM, multiply it by 2 to get it in 30 minute intervals.
    const end_time = 23 * 2;

    // Generate the options for the select element
    const options = Array();

    for (var i = start_time; i <= end_time; i++) {
      const current_date = new Date(d);

      // convert from '30 minute interval' to real time
      current_date.setHours(i / 2);
      current_date.setMinutes((i % 2) * 30);

      options.push(
        <option key={i} value={i}>
          {current_date.toLocaleTimeString()}
        </option>
      );
    }

    // register onInput with our callback
    return (
      <div className={"form-group " + this.props.className}>
        <div className="input-group w-100">
          <div className="input-group-prepend">
            <label className="input-group-text">Hour</label>
          </div>
          <select className="custom-select" onInput={this.onInputCallback}>
            {options}
          </select>
        </div>
      </div>
    );
  }
}

// This component is used to display the various filters someone can use when searching for meals
// Has a `onStartTimeChanged` property which is an event delegated to the HourControl's onStartTimeChanged
// and `onAddressChanged` property which is an event delegated to AddressControl's onAddressChanged
// It also has a `defaultAddress` which is forwarded to AddressControl to display a default value
class MealFilters extends React.Component {
  constructor(props) {
    super(props);
    // this.props.onStartTimeChanged : callback when a time filter is changed
  }

  render() {
    return (
      <div className="form-inline">
        <div className="input-group col-7 p-0 pr-3">
          <div className="input-group-prepend">
            <span className="input-group-text">Where</span>
          </div>
          <AddressControl
            className="form-control"
            defaultAddress={this.props.defaultAddress}
            onAddressChanged={this.props.onAddressChanged}
          />
        </div>
        <DateDisply className="col-2 p-0 pr-3" />
        <HourControl
          className="col-3 p-0"
          onStartTimeChanged={this.props.onStartTimeChanged}
        />
      </div>
    );
  }
}

// Component that draws a meal in the meals page
// It has a button that goes to the reserve page
class Meal extends React.Component {
  constructor(props) {
    super(props);
  }

  goToReservation = () => {
    window.location =
      "/reserve?" +
      $.param({
        meal_id: this.props.meal_id
      });
  };

  render() {
    return (
      <div className="card mc-card-size mb-5">
        <img
          className="card-img-top mc-card-image-size"
          src={this.props.meal.picture_url}
        />
        <div className="card-body">
          <h6 className="card-title">{this.props.meal.name}</h6>
          <div>
            Pick-up&nbsp;
            {moment
              .utc(parseInt(this.props.meal.pickupTime * 1000))
              .local()
              .fromNow()}
          </div>
          <div>Distance: {this.props.meal.distance * 0.000621371} miles</div>
          <button
            className="btn mc-primary-bg-color text-white w-100 mt-2"
            onClick={this.goToReservation}
          >
            Reserve
          </button>
        </div>
      </div>
    );
  }
}

// Component that draws the meal querying page for a user.
// `location` and `startTime` are used to control the ajax queries.
// The MealFilters component is used for filtering
class Meals extends React.Component {
  constructor(props) {
    super(props);
    // the server will set up these defaults for us so we have
    // something to draw
    // TODO handle if these aren't set
    this.location = {
      address: this.props.defaultAddress,
      lat: this.props.defaultLat,
      lng: this.props.defaultLng
    };

    // This special value means the current time to the server
    this.startTime = { hour: 0, minutes: 0 };

    // Initial query for meals to the server with default address
    this.queryMeals();

    this.state = { meals: [] };
  }

  // Called by the time component when the user changes the time filter
  onStartTimeChangedCallback = (hour, minutes) => {
    this.startTime = { hour: hour, minutes: minutes };

    // We only query if we have a valid location and time
    if (this.startTime !== null && this.location !== null) {
      this.queryMeals();
    }
  };

  // Called by the address component when the user changes the address
  onAddressChangedCallback = place => {
    this.location = {
      address: place.formatted_address,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng
    };

    // We only query if we have a valid location and time
    if (this.startTime !== null && this.location !== null) {
      this.queryMeals();
    }
  };

  queryMeals() {
    const params = {
      address: this.location.address,
      lat: this.location.lat,
      lng: this.location.lng,
      startTimeHour: this.startTime.hour,
      startTimeMinutes: this.startTime.minutes
    };
    $.getJSON("api/meals", params, meals => {
      this.setState({ meals: meals });
    });
  }

  render() {
    const meal_components = new Array();

    this.state.meals.forEach(meal => {
      meal_components.push(
        <Meal key={meal.meal_id} meal_id={meal.meal_id} meal={meal} />
      );
    });

    return (
      <div className="container">
        <MealFilters
          defaultAddress={this.props.defaultAddress}
          onStartTimeChanged={this.onStartTimeChangedCallback}
          onAddressChanged={this.onAddressChangedCallback}
        />
        <div className="d-flex mt-5 flex-wrap justify-content-between">
          {meal_components}
        </div>
      </div>
    );
  }
}

// Component that draws the landing page
// It has an address control and 2 buttons to go to the main
// 2 flows of the application.
class LandingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      place: null
    };
  }
  onAddressChangedCallback = place => {
    this.setState({ place: place });
  };

  goToMeals = () => {
    window.location =
      "/meals?" +
      $.param({
        address: this.state.place.formatted_address,
        lat: this.state.place.geometry.location.lat,
        lng: this.state.place.geometry.location.lng
      });
  };

  goToHost = () => {
    window.location =
      "/host?" +
      $.param({
        address: this.state.place.formatted_address,
        lat: this.state.place.geometry.location.lat,
        lng: this.state.place.geometry.location.lng
      });
  };

  render() {
    return (
      <div className="landing-page-background row align-items-center justify-content-center mx-0">
        <div className="d-flex flex-column justify-content-center input-group landing-page-controls">
          <p>Share a meal.</p>
          <p>Near you.</p>
          <p>For free.</p>
          <AddressControl
            className="mc-input-text"
            onAddressChanged={this.onAddressChangedCallback}
          />
          <button
            type="button"
            className="btn mc-btn-primary mc-primary-bg-color mb-3 input-group"
            disabled={this.state.place === null}
            onClick={this.goToMeals}
          >
            Find a meal
          </button>
          <p id="or">Or</p>
          <button
            type="button"
            className="btn mc-btn-primary mc-primary-bg-color mb-3 input-group"
            disabled={this.state.place === null}
            onClick={this.goToHost}
          >
            Make a meal
          </button>
        </div>
      </div>
    );
  }
}

// This component shows inputs for registering a user and does
// an ajax request to register the user.
// It has 2 events, `onUserRegistered` is called when a successful
// registration happens, or `onLoginRequested` is called if the
// user presses the "login instead" button to switch forms.
class RegisterUser extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      password: "",
      email: "",
      address: "",
      errorMessage: null
    };
  }

  registerUser = () => {
    $.post("api/register_user", this.state, user_response => {
      if (user_response.error) {
        this.setState({ errorMessage: user_response.error });
      } else {
        this.props.onUserRegistered(user_response.user);
      }
    });
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const shouldDisableRegisterButton =
      this.state.firstName === "" ||
      this.state.lastName === "" ||
      this.state.phoneNumber === "" ||
      this.state.password === "" ||
      this.state.email === "";

    var errorComponent = null;
    if (this.state.errorMessage !== null) {
      errorComponent = (
        <div className="row">
          <div className="col-12 p-2">
            <span className="w-100 h-100 input-group-text mc-border-error mc-text-color-error mc-bg-color-error">
              {this.state.errorMessage}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="container border m-0 p-0">
        <div className="container border-bottom">
          <div className="row">
            <h5 className="col-8 m-0 h-100 my-auto">Register</h5>
            <div className="col-2 p-2">
              <button
                className="btn form-control mc-btn-outline w-100"
                onClick={() => this.props.onLoginRequested()}
              >
                Login Instead
              </button>
            </div>
            <div className="col-2 p-2">
              <button
                className="btn form-control mc-button-regular w-100"
                disabled={shouldDisableRegisterButton}
                onClick={this.registerUser}
              >
                Register User
              </button>
            </div>
          </div>
        </div>

        <div className="mc-background-form container">
          <div className="row">
            <div className="col-4 p-2">
              <input
                className="form-control w-100"
                type="text"
                name="firstName"
                placeholder="First Name"
                value={this.state.firstName}
                onChange={this.handleChange}
              />
            </div>
            <div className="col-4 p-2">
              <input
                className="form-control w-100"
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={this.state.lastName}
                onChange={this.handleChange}
              />
            </div>
            <div className="col-4 p-2">
              <input
                className="form-control w-100"
                type="text"
                name="address"
                placeholder="Address"
                value={this.state.address}
                onChange={this.handleChange}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-4 p-2">
              <input
                className="form-control w-100"
                type="text"
                name="email"
                placeholder="Email"
                value={this.state.email}
                onChange={this.handleChange}
              />
            </div>
            <div className="col-4 p-2">
              <input
                className="form-control w-100"
                type="text"
                name="phoneNumber"
                placeholder="Phone Number"
                value={this.state.phoneNumber}
                onChange={this.handleChange}
              />
            </div>
            <div className="col-4 p-2">
              <input
                className="form-control w-100"
                type="password"
                name="password"
                placeholder="Password"
                value={this.state.password}
                onChange={this.handleChange}
              />
            </div>
          </div>
          {errorComponent}
        </div>
      </div>
    );
  }
}

// This component handles logging a user in via a form and an ajax request
// It has 2 events, `onUserLoggedIn` is called when a user successfully logs in.
// `onRegisterRequested` is the user presses the register button to switch to
// the registration form.
class LoginUser extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      errorMessage: null
    };
  }

  requestLogin = () => {
    $.post("api/login", this.state, user_response => {
      if (user_response.error) {
        this.setState({ errorMessage: user_response.error });
      } else {
        this.props.onUserLoggedIn(user_response.user);
      }
    });
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const shouldDisableLoginButton =
      this.state.email === "" || this.state.password === "";

    var errorComponent = null;
    if (this.state.errorMessage !== null) {
      errorComponent = (
        <div className="row">
          <div className="col-12 p-2">
            <span className="w-100 h-100 input-group-text mc-border-error mc-text-color-error mc-bg-color-error">
              {this.state.errorMessage}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="container border m-0 p-0">
        <div className="container border-bottom">
          <div className="row">
            <h5 className="col-8 m-0 h-100 my-auto">Log In</h5>
            <div className="col-2 p-2">
              <button
                className="btn form-control mc-btn-outline w-100"
                onClick={() => this.props.onRegisterRequested()}
              >
                Register Instead
              </button>
            </div>
            <div className="col-2 p-2">
              <button
                className="btn form-control mc-button-regular w-100"
                disabled={shouldDisableLoginButton}
                onClick={this.requestLogin}
              >
                Log In
              </button>
            </div>
          </div>
        </div>
        <div className="mc-background-form container">
          <div className="row">
            <div className="col-6 p-2">
              <input
                className="form-control w-100"
                type="text"
                name="email"
                placeholder="Email"
                value={this.state.phoneNumber}
                onChange={this.handleChange}
              />
            </div>
            <div className="col-6 p-2">
              <input
                className="form-control w-100"
                type="password"
                name="password"
                placeholder="Password"
                value={this.state.password}
                onChange={this.handleChange}
              />
            </div>
          </div>
          {errorComponent}
        </div>
      </div>
    );
  }
}

// This component uses the Login and Register components to create
// a component to handle login, registration, and logout.
// It does so by toggling between 4 states:
// loading - We send an ajax request to the server to try to get the logged in user from the session
// unauthenticated-register - Shows the register component
// unauthenticated-login - Shows the login component
// logged-in - Shows user info and a logout button
// It has an event property `onUserResolved` which gets
// called when a user is resolved from either the session via ajax, the login component, or registration
class UserInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current: "loading"
    };
    this.getLoggedInUser();
  }

  getLoggedInUser() {
    $.getJSON("api/user", null, user => {
      this.userRegisteredOrLoggedIn(user);
    }).fail(() => {
      this.setState({ current: "unauthenticated-register" });
    });
  }

  loginRequested = () => {
    this.setState({ current: "unauthenticated-login" });
  };

  registerRequested = () => {
    this.setState({ current: "unauthenticated-register" });
  };

  userRegisteredOrLoggedIn = user => {
    this.setState({ current: "logged-in", user: user });
    this.props.onUserResolved(user);
  };

  logOut = () => {
    $.post("api/logout", null, user => {
      this.setState({ current: "unauthenticated-register", user: null });
      this.props.onUserResolved(null);
    });
  };

  render() {
    var componentToRender = null;

    if (this.state.current === "logged-in") {
      componentToRender = (
        <div className="container">
          <div className="row">
            <div className="container border">
              <div className="row">
                <h5 className="col-10 m-0 h-100 my-auto">
                  Hello {this.state.user.firstName}
                </h5>
                <div className="col-2 p-2">
                  <button
                    className="btn form-control mc-button-regular w-100"
                    onClick={this.logOut}
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (this.state.current === "unauthenticated-register") {
      componentToRender = (
        <RegisterUser
          onLoginRequested={this.loginRequested}
          onUserRegistered={this.userRegisteredOrLoggedIn}
        />
      );
    } else if (this.state.current === "unauthenticated-login") {
      componentToRender = (
        <LoginUser
          onRegisterRequested={this.registerRequested}
          onUserLoggedIn={this.userRegisteredOrLoggedIn}
        />
      );
    } else {
      componentToRender = <div></div>;
    }

    return componentToRender;
  }
}

// This component handles showing confirmation and final reservation of a meal.
// It reads the meal_id from the current URL and uses ajax to get the details
// It uses the UserInfo component to get a user
// Once it has all the information the form can be used to submit the reservation
class Reserve extends React.Component {
  constructor(props) {
    super(props);
    const searchParams = new URLSearchParams(window.location.search);
    const mealID = searchParams.get("meal_id");

    this.state = {
      meal: null,
      user: null
    };

    this.getMealByID(mealID);
  }

  getMealByID = mealID => {
    $.getJSON("/api/meal", { meal_id: mealID }).done(meal => {
      this.setState({ meal: meal });
    });
  };

  setUser = user => {
    this.setState({ user: user });
  };

  render() {
    var meal_component = null;
    // TODO handle failed meal query
    if (this.state.meal !== null) {
      meal_component = (
        <div className="container py-2">
          <div className="row">
            <div className="col-8">
              <div className="container"></div>
              <h5>{this.state.meal.name}</h5>
              <h6>Address: {this.state.meal.address}</h6>
              <h6>
                Pick up&nbsp;
                {moment
                  .utc(parseInt(this.state.meal.pickupTime * 1000))
                  .local()
                  .fromNow()}
                &nbsp;(
                {moment
                  .utc(parseInt(this.state.meal.pickupTime) * 1000)
                  .local()
                  .format("MMM Do h:mm")}
                )
              </h6>
              <pre className="mc-meal-description">
                {this.state.meal.description}
              </pre>
              <div className="row">
                <div className="col-12">
                  <img className="w-100" src={this.state.meal.picture_url} />
                </div>
              </div>
            </div>
            <div className="col-4">
              <div className="container">
                <div className="row">
                  <h5>Next Steps</h5>
                </div>

                <div className="row">You are about to reserve this meal!</div>

                <div className="row">
                  Check out the details on the left and make sure everything
                  looks correct. Once you press the Reserve button your
                  reservation will be confirmed. All you have to do is show and
                  and show your host the confirmation page. Enjoy!
                </div>
                <form action="/reserve" method="POST" className="row mt-2">
                  <input
                    type="hidden"
                    name="meal_id"
                    value={
                      this.state.meal === null ? "" : this.state.meal.meal_id
                    }
                  />
                  <button
                    className="btn form-control mc-button-regular w-100"
                    disabled={this.state.user === null}
                  >
                    Reserve
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="container p-0">
        <div className="row">
          <div className="col-12">
            <UserInfo onUserResolved={this.setUser} />
          </div>
        </div>
        <div className="row mt-2">
          <div className="col-12">
            <div className="border">{meal_component}</div>
          </div>
        </div>
      </div>
    );
  }
}

// This component is used to display the active reservation of the currently logged in
// user, which will have details for contacting the host and the address
// It also shows the location on a google map
class Reservations extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      meal: null
    };

    this.queryReservations();
  }

  queryReservations() {
    $.getJSON("/api/reservations")
      .done(meal => {
        this.setState({ meal: meal });
      })
      .fail(() => {
        window.location = "/";
      });
  }

  setUser = user => {
    if (user === null) {
      window.location = "/";
    }
  };

  render() {
    var components = null;

    if (this.state.meal !== null) {
      const position = { lat: this.state.meal.lat, lng: this.state.meal.lng };
      components = (
        <div className="container">
          <div className="row">
            <div className="col-12 p-0">
              <UserInfo onUserResolved={this.setUser} />
            </div>
          </div>
          <div className="row border mt-2">
            <div className="col-12 p-2">
              <h5>Your meal reservation</h5>
            </div>
          </div>
          <div className="row border mt-2">
            <div className="col-6 p-2">
              <h5>{this.state.meal.name}</h5>
              <h6>Address: {this.state.meal.address}</h6>
              <h6>
                Pick up&nbsp;
                {moment
                  .utc(parseInt(this.state.meal.pickupTime * 1000))
                  .local()
                  .fromNow()}
                &nbsp;(
                {moment
                  .utc(parseInt(this.state.meal.pickupTime) * 1000)
                  .local()
                  .format("MMM Do h:mm")}
                )
              </h6>
              <pre className="mc-meal-description">
                {this.state.meal.description}
              </pre>
              <img className="w-100" src={this.state.meal.picture_url} />
            </div>
            <div className="col-6 p-2">
              <h5>
                Show this information to your host to confirm your identity
              </h5>
              <h6>Host Phone Number {this.state.meal.hostPhoneNumber}</h6>
              <h6>Your Phone Number {this.state.meal.userPhoneNumber}</h6>
              <GoogleMap location={position} />
            </div>
          </div>
        </div>
      );
    } else {
      // TODO no meal
    }

    return components;
  }
}

// This component is used by the host meal creation flow
// It collects all the data required using previously created
// components along with some extras.
// It also uses ajax to query upcoming meal events the host has created
// and previous meal events for reference.
class MakeMeal extends React.Component {
  constructor(props) {
    super(props);
    const searchParams = new URLSearchParams(window.location.search);
    this.defaultAddress = searchParams.get("address");
    const defaultLat = searchParams.get("lat");
    const defaultLng = searchParams.get("lng");
    this.state = {
      previousMeals: [],
      upcomingMeals: [],
      meal: null,
      mealName: "",
      mealDescription: "",
      address: this.defaultAddress,
      hour: 0,
      minute: 0,
      lat: defaultLat,
      lng: defaultLng,
      mealServings: "",
      user: null
    };
  }

  queryMealEvents = () => {
    $.getJSON("/api/meal_events", null, mealEvents => {
      this.setState({
        previousMeals: mealEvents.previous_meal_events,
        upcomingMeals: mealEvents.upcoming_meal_events
      });
    }).fail(e => {
      console.log(e);
    });
  };

  onAddressChangedCallback = place => {
    this.setState({
      address: place.formatted_address,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    });
  };

  onStartTimeChangedCallback = (hour, minute) => {
    this.setState({ hour: hour, minute: minute });
  };

  setUser = user => {
    this.setState({ user: user, previousMeals: [], upcomingMeals: [] });
    if (user !== null) {
      this.queryMealEvents();
    }
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render = () => {
    const disableMakeMealButton =
      this.state.mealName === "" ||
      this.state.mealDescription === "" ||
      this.state.address === "" ||
      this.state.mealServings === "" ||
      this.state.user === null;

    const upcomingMeals = [];
    const previousMeals = [];

    this.state.upcomingMeals.forEach(meal => {
      upcomingMeals.push(<HostMealEvent key={meal.meal_id} meal={meal} />);
    });

    this.state.previousMeals.forEach(meal => {
      previousMeals.push(<HostMealEvent key={meal.meal_id} meal={meal} />);
    });

    return (
      <div className="container">
        <div className="row p-0">
          <div className="col-12 p-0">
            <UserInfo onUserResolved={this.setUser} />
          </div>
        </div>
        <HostMealList meals={upcomingMeals} time_label="Upcoming" />
        <div className="row mt-2">
          <div className="col-12 border py-2">
            <div className="container mt-2">
              <div className="row form-inline">
                <div className="input-group col-9">
                  <div className="input-group-prepend">
                    <span className="input-group-text">Where</span>
                  </div>
                  <AddressControl
                    className="form-control"
                    defaultAddress={this.defaultAddress}
                    onAddressChanged={this.onAddressChangedCallback}
                  />
                </div>

                <HourControl
                  className="col-3"
                  onStartTimeChanged={this.onStartTimeChangedCallback}
                />
              </div>

              <form action="/host" method="POST" encType="multipart/form-data">
                <input type="hidden" name="hour" value={this.state.hour} />
                <input type="hidden" name="minute" value={this.state.minute} />
                <input
                  type="hidden"
                  name="address"
                  value={this.state.address}
                />
                <input type="hidden" name="lat" value={this.state.lat} />
                <input type="hidden" name="lng" value={this.state.lng} />

                <div className="row form-inline mt-2">
                  <div className="input-group col-6">
                    <div className="input-group-prepend">
                      <span className="input-group-text">Title</span>
                    </div>
                    <input
                      className="form-control"
                      type="text"
                      name="mealName"
                      placeholder="Title"
                      value={this.state.mealName}
                      onChange={this.handleChange}
                    />
                  </div>
                  <div className="input-group col-3">
                    <div className="input-group-prepend">
                      <span className="input-group-text">Servings</span>
                    </div>
                    <input
                      className="form-control"
                      type="text"
                      name="mealServings"
                      placeholder="Servings"
                      value={this.state.mealServings}
                      onChange={this.handleChange}
                    />
                  </div>
                  <input
                    className="form-control-file col-3"
                    type="file"
                    name="file"
                    accept="image/jpeg"
                  />
                </div>
                <div className="row form-inline mt-2">
                  <div className="col-12">
                    <textarea
                      className="form-control w-100"
                      name="mealDescription"
                      rows="10"
                      placeholder="Description"
                      value={this.state.mealDescription}
                      onChange={this.handleChange}
                    />
                  </div>
                </div>
                <div className="row form-inline mt-2">
                  <div className="col-9"></div>
                  <div className="col-3">
                    <button
                      className="btn form-control mc-button-regular w-100"
                      disabled={disableMakeMealButton}
                    >
                      Cast your meal!
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        <HostMealList meals={previousMeals} time_label="Previous" />
      </div>
    );
  };
}

// This component draws a host's meal events
// It has some extra information that the regular meal component
// shouldn't show like the servings.
class HostMealEvent extends React.Component {
  constructor(props) {
    super(props);
  }

  onClick = () => {
    this.props.seeDetailsEvent(this.props.meal);
  };

  getDetailsURL() {
    return (
      "/host/meal?" +
      $.param({
        meal_id: this.props.meal.meal_id
      })
    );
  }
  render() {
    return (
      <div className="row mb-2">
        <div className="col-12">
          <div className="container">
            <div className="row border p-2">
              <div className="col-1 p-0">
                <img
                  className="mc-host-detail-thumbnail"
                  src={this.props.meal.picture_url}
                />
              </div>
              <div className="col-11 p-0">
                <div className="container h-100">
                  <div className="row h-50 ">
                    <div className="col-6">
                      <span className="align-middle">
                        Name: {this.props.meal.name}
                      </span>
                    </div>
                    <div className="col-3">
                      <span className="align-middle">
                        {moment
                          .utc(parseInt(this.props.meal.pickupTime) * 1000)
                          .local()
                          .format("MMM Do h:mm")}
                      </span>
                    </div>
                    <div className="col-3 text-right">
                      <span className="align-middle ">
                        Confirmed reservations{" "}
                        {this.props.meal.reservations.length} /{" "}
                        {this.props.meal.servings}
                      </span>
                    </div>
                  </div>
                  <div className="row h-50">
                    <div className="col-8">
                      <span className="align-middle">
                        Address: {this.props.meal.address}
                      </span>
                    </div>
                    <div className="col-4 text-right">
                      <span className="align-middle">
                        <a href={this.getDetailsURL()} className="mc-link">
                          See details
                        </a>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// This component draws the details of a host's meal
// This includes all information for the meal including
// Who is coming so they can verify and cross reference guests
// when they come to grab their meal.
class HostMealDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      meal: null
    };
    this.queryHostMeal();
  }

  queryHostMeal = () => {
    let searchParams = new URLSearchParams(window.location.search);
    const mealID = searchParams.get("meal_id");
    $.getJSON("/api/host/meal/", { meal_id: mealID }, meal => {
      this.setState({ meal: meal });
    });
  };

  render() {
    var mealDiv = null;
    const guests = [];
    if (this.state.meal !== null) {
      mealDiv = <div>{this.state.meal.name}</div>;

      this.state.meal.reservations.forEach(reservation => {
        guests.push(
          <div>
            <span>{reservation.user.firstName}</span>
            <span>{reservation.user.lastName}</span>
            <span>Phone Number:{reservation.user.phoneNumber}</span>
          </div>
        );
      });
    }
    return (
      <div>
        {mealDiv}
        {guests}
      </div>
    );
  }
}

class HostMealList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.meals.length > 0) {
      return (
        <div className="row mt-2 border pt-2">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <h5>{this.props.time_label} meals</h5>
              </div>
            </div>
            {this.props.meals}
          </div>
        </div>
      );
    } else {
      return (
        <div className="row mt-2 border pt-2">
          <h5 className="col-10 m-0 h-100 my-auto">
            No {this.props.time_label} meals
          </h5>
          <div className="col-2 p-2">
            <button className="btn form-control mc-button-regular w-100 invisible">
              Placeholder for sizing
            </button>
          </div>
        </div>
      );
    }
  }
}
