
var defaultBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(37.804840, -122.539670),
    new google.maps.LatLng(37.712055, -122.3513996));

    var options = {
        bounds: defaultBounds,
        types: ['address']
    };
var input = document.getElementById('searchTextField');


autocomplete = new google.maps.places.Autocomplete(input, options);

autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace()
    const userAdressForm = document.getElementById('user-address-form')
    const latForm = document.getElementById('lat-form')
    const lngForm = document.getElementById('lng-form')

    userAdressForm.value = place.formatted_address
    latForm.value = place.geometry.location.lat()
    console.log(latForm.value)
    lngForm.value = place.geometry.location.lng()
    console.log(lngForm.value)
});
