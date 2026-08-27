const api = "http://localhost:8080";

const apiEndpoints = {
    master: {
        country: {
            CountryAddEdit: "/master/country/addEditCountry",
            CountryGetData: "/master/country/getCountry",
            CountryDeleteByID: "/master/country/deleteCountryById",
            CountryGetByID: "/master/country/getCountryById",
        }
    },

    user: {
        get: "/user/getUsers",
        add: "/user/addUser",
    }
};

export { api, apiEndpoints };