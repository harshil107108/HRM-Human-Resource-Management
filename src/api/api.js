const api = import.meta.env.VITE_API_URL;

const apiEndpoints = {
    master: {
        country: {
            CountryAddEdit: "/master/country/addEditCountry",
            CountryGetData: "/master/country/getCountry",
            CountryDeleteByID: "/master/country/deleteCountryById",
            CountryGetByID: "/master/country/getCountryById",
            CountryHelp: "/master/country/getCountryHelp"
        },
        city: {
            CityAddEdit: "/master/city/addEditCity",
            CityGetData: "/master/city/getCity",
            CityDeleteByID: "/master/city/deleteCityById",
            CityGetByID: "/master/city/getCityById",
            CityHelp: "/master/city/getCityHelp",
        },
        state: {
            StateAddEdit: "/master/state/addEditState",
            StateGetData: "/master/state/getState",
            StateDeleteByID: "/master/state/deleteStateById",
            StateGetByID: "/master/state/getStateById",
            StateHelp: "/master/state/getStateHelp",
        }

    },

    user: {
        get: "/user/getUsers",
        add: "/user/addUser",
    }
};

export { api, apiEndpoints };