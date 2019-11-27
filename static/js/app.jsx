
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

        // add a listener whenever an address is picked, we propagate this to our onAddressChanged event -> DONE
        this.autocomplete.addListener('place_changed', () => {
            const place = this.autocomplete.getPlace()
            this.props.onAddressChanged(place)
        });
    }

    render() {
        return <input ref={this.myRef} id="address-input" />
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
                <AddressControl onAddressChanged={this.props.onAddressChanged} />
                <DateDisply />
                <HourControl onStartTimeChanged={this.props.onStartTimeChanged}/>
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
        this.location = null
        this.startTime = Date.now()
        this.state = { meals: [] };
    }

    onStartTimeChangedCallback = (hour, minutes) => {
        this.startTime = {hour: hour, minutes: minutes}

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
        $.getJSON("api/meals", {address:this.location.address, lat:this.location.lat, lng:this.location.lng}, (meals) => {
            this.setState({meals: meals})
          });
    }
    
    render() {
        const meals = new Array()

        return (
            <MealFilters
                onStartTimeChanged={this.onStartTimeChangedCallback} 
                onAddressChanged={this.onAddressChangedCallback}/>)
    }
}

