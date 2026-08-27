const api = "http://localhost:8080";

const apiEndpoints = {
    master: {
        country: {
            CountryAddEdit: "/master/country/addEditCountry",
            CountryGetData: "/master/country/getCountry",
            CountryDeleteByID: "/master/country/deleteCountryById",
            CountryGetByID: "/master/country/getCountryById",
        },
        city: {
            CityAddEdit: "/master/city/addEditCity",
            CityGetData: "/master/city/getCity",
            CityDeleteByID: "/master/city/deleteCityById",
            CityGetByID: "/master/city/getCityById",
        }
    },

    user: {
        get: "/user/getUsers",
        add: "/user/addUser",
    }
};

export { api, apiEndpoints };