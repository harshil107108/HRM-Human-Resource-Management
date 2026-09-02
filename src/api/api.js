const api = "http://localhost:8080";

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
        },
        holiday: {
            HolidayAddEdit: "/master/holiday/addEditHoliday",
            HolidayGetData: "/master/holiday/getHoliday",
            HolidayDeleteByID: "/master/holiday/deleteHolidayById",
            HolidayGetByID: "/master/holiday/getHolidayById",
            HolidayHelp: "/master/holiday/getHolidayHelp",
        },
        bank: {
            BankAddEdit: "/master/bank/addEditBank",
            BankGetData: "/master/bank/getBank",
            BankDeleteByID: "/master/bank/deleteBankById",
            BankGetByID: "/master/bank/getBankById",
            BankHelp: "/master/bank/getBankHelp",
        },

    },

    employee: {
        employee: {
            EmployeeAddEdit: "/employee/addEditEmployee",
            EmployeeGetData: "/employee/getEmployee",
            EmployeeDeleteByID: "/employee/deleteEmployeeById",
            EmployeeGetByID: "/employee/getEmployeeById",
            EmployeeHelp: "/employee/getEmployeeHelp",
        }
    },

    organization: {
        company: {
            CompanyAddEdit: "/organization/company/addEditCompany",
            CompanyGetData: "/organization/company/getCompany",
            CompanyDeleteByID: "/organization/company/deleteCompanyById",
            CompanyGetByID: "/organization/company/getCompanyById",
            CompanyHelp: "/organization/company/getCompanyHelp",
        },
        branch: {
            BranchAddEdit: "/organization/branch/addEditBranch",
            BranchGetData: "/organization/branch/getBranch",
            BranchDeleteByID: "/organization/branch/deleteBranchById",
            BranchGetByID: "/organization/branch/getBranchById",
            BranchHelp: "/organization/branch/getBranchHelp",
        },
        department: {
            DepartmentAddEdit: "/organization/department/addEditDepartment",
            DepartmentGetData: "/organization/department/getDepartment",
            DepartmentDeleteByID: "/organization/department/deleteDepartmentById",
            DepartmentGetByID: "/organization/department/getDepartmentById",
            DepartmentHelp: "/organization/department/getDepartmentHelp",
        },
        designation: {
            DesignationAddEdit: "/organization/designation/addEditDesignation",
            DesignationGetData: "/organization/designation/getDesignation",
            DesignationDeleteByID: "/organization/designation/deleteDesignationById",
            DesignationGetByID: "/organization/designation/getDesignationById",
            DesignationHelp: "/organization/designation/getDesignationHelp",
        }
    },

    user: {
        get: "/user/getUsers",
        add: "/user/addUser",
    }
};

export { api, apiEndpoints };