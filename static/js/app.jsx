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
    return (
      <div ref={this.myRef} style={{ height: 400 + "px", width: 400 + "px" }} />
    );
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
    return <input ref={this.myRef} placeholder={placeholder} />;
  }
}

// TODO style this better
class DateDisply extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <pre>
        <span>WHEN: Today</span>
      </pre>
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
    return <select onInput={this.onInputCallback}>{options}</select>;
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
      <div>
        <AddressControl
          defaultAddress={this.props.defaultAddress}
          onAddressChanged={this.props.onAddressChanged}
        />
        <DateDisply />
        <HourControl onStartTimeChanged={this.props.onStartTimeChanged} />
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
      <div>
        <span>
          ID: {this.props.meal_id}
          Name: {this.props.name}
        </span>
        <div>
          Pick-up
          {moment
            .utc(parseInt(this.props.startTime * 1000))
            .local()
            .fromNow()}
        </div>
        <span>Distance: TODO</span>
        <button onClick={this.goToReservation}>Reserve</button>
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
        <Meal
          key={meal.meal_id}
          meal_id={meal.meal_id}
          name={meal.name}
          startTime={meal.pickupTime}
        />
      );
    });

    return (
      <div>
        <MealFilters
          defaultAddress={this.props.defaultAddress}
          onStartTimeChanged={this.onStartTimeChangedCallback}
          onAddressChanged={this.onAddressChangedCallback}
        />
        {meal_components}
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
    window.location = "/host";
  };

  render() {
    return (
      // TODO Landing page login btn

      <div>
        <div>
          <button>Login</button>
        </div>
        <div>
          <AddressControl onAddressChanged={this.onAddressChangedCallback} />
        </div>
        <div>
          <button disabled={this.state.place === null} onClick={this.goToMeals}>
            Find a Meal
          </button>
        </div>
        <div>Or</div>
        <div>
          <button disabled={this.state.place === null} onClick={this.goToHost}>
            Make a Meal
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
    return (
      <div>
        <div>
          <button onClick={() => this.props.onLoginRequested()}>
            Login Instead
          </button>
          {/* TODO style the error better */}
          {this.state.errorMessage}
        </div>
        <div>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={this.state.firstName}
            onChange={this.handleChange}
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={this.state.lastName}
            onChange={this.handleChange}
          />
          <input
            type="text"
            name="email"
            placeholder="Email"
            value={this.state.email}
            onChange={this.handleChange}
          />
          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number"
            value={this.state.phoneNumber}
            onChange={this.handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={this.state.password}
            onChange={this.handleChange}
          />
          <button
            disabled={shouldDisableRegisterButton}
            onClick={this.registerUser}
          >
            Register User
          </button>
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
    return (
      <div>
        <div>
          <button onClick={() => this.props.onRegisterRequested()}>
            Register Instead
          </button>
          {/* TODO style error better  */}
          {this.state.errorMessage}
        </div>
        <div>
          <input
            type="text"
            name="email"
            placeholder="Email"
            value={this.state.phoneNumber}
            onChange={this.handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={this.state.password}
            onChange={this.handleChange}
          />
          <button
            disabled={shouldDisableLoginButton}
            onClick={this.requestLogin}
          >
            Log In
          </button>
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
        <div>
          <span>Hello User {this.state.user.firstName}</span>
          <button onClick={this.logOut}>Log Out</button>
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
      // We're waiting for the ajax query to get the user so don't show anything yet
    }

    return <div>{componentToRender}</div>;
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
        <div>
          <div>Meal ID: {this.state.meal.meal_id}</div>
          <div>Name: {this.state.meal.name}</div>
        </div>
      );
    }
    return (
      <div>
        <UserInfo onUserResolved={this.setUser} />
        <div>
          {meal_component}
          <form action="/reserve" method="POST">
            <input
              type="hidden"
              name="meal_id"
              value={this.state.meal === null ? "" : this.state.meal.meal_id}
            />
            <button disabled={this.state.user === null}>Reserve</button>
          </form>
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
    $.getJSON("/api/reservations").done(meal => {
      this.setState({ meal: meal });
    });
  }

  render() {
    var components = null;
    if (this.state.meal !== null) {
      const position = { lat: this.state.meal.lat, lng: this.state.meal.lng };
      components = (
        <div>
          <div>TODO show rest of details</div>
          <GoogleMap location={position} />
        </div>
      );
    }
    // TODO print details
    // if (this.state.reservation !== null) {
    //
    //   reservation_details = <div>{this.state.reservation.meal.name}</div>;
    // }

    return (
      <div>
        {components}
        <a href="/">Go Home</a>
      </div>
    );
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
    this.state = {
      previousMeals: [],
      upcomingMeals: [],
      meal: null,
      mealName: "",
      mealDescription: "",
      address: "",
      hour: 0,
      minute: 0,
      lat: "",
      lng: "",
      mealServings: "",
      user: null
    };

    this.queryMealEvents();
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

  onSeeDetails = meal => {
    window.location =
      "/host/meal?" +
      $.param({
        meal_id: meal.meal_id
      });
  };

  render = () => {
    const upcomingMeals = [];
    const previousMeals = [];

    this.state.upcomingMeals.forEach(meal => {
      upcomingMeals.push(
        <HostMealEvent
          key={meal.meal_id}
          meal={meal}
          seeDetailsEvent={this.onSeeDetails}
        />
      );
    });

    this.state.previousMeals.forEach(meal => {
      previousMeals.push(<HostMealEvent key={meal.meal_id} meal={meal} />);
    });

    return (
      <div>
        <UserInfo onUserResolved={this.setUser} />
        <div>
          Current Meals:
          {upcomingMeals}
        </div>
        <AddressControl onAddressChanged={this.onAddressChangedCallback} />
        <span>
          Pickup time
          <HourControl onStartTimeChanged={this.onStartTimeChangedCallback} />
        </span>
        <form action="/host" method="POST" enctype="multipart/form-data">
          <input type="hidden" name="hour" value={this.state.hour} />
          <input type="hidden" name="minute" value={this.state.minute} />
          <input type="hidden" name="address" value={this.state.address} />
          <input type="hidden" name="lat" value={this.state.lat} />
          <input type="hidden" name="lng" value={this.state.lng} />
          <input
            type="text"
            name="mealName"
            placeholder="Title"
            value={this.state.mealName}
            onChange={this.handleChange}
          />
          <input
            type="text"
            name="mealDescription"
            placeholder="Description"
            value={this.state.mealDescription}
            onChange={this.handleChange}
          />
          <input type="file" name="file" accept="image/jpeg" />
          <input
            type="text"
            name="mealServings"
            placeholder="Servings"
            value={this.state.mealServings}
            onChange={this.handleChange}
          />
          <button disabled={this.state.user === null}>Cast your meal!</button>
        </form>
        <div>
          <div>
            Previous Meals:
            {previousMeals}
          </div>
        </div>
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

  render() {
    return (
      <div>
        <span>Name: {this.props.meal.name}</span>
        <span>
          {" "}
          Date:{" "}
          {moment
            .utc(parseInt(this.props.meal.pickupTime) * 1000)
            .local()
            .format("MMM Do h:mm")}
        </span>
        <span>
          {" "}
          Confirmed Reservations: {this.props.meal.reservations.length}/
          {this.props.meal.servings}
        </span>
        <img src={this.props.meal.pictureURL} />
        <button onClick={this.onClick}>See Details</button>
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
