import React from "react";
import { api, apiEndpoints } from "@/api/api";

const useCompanyConfig = ({ handleDelete } = {}) => {
  const businessInfoSchema1 = [
    {
      id: "gstNumber",
      type: "text",
      label: "GST Number",
      placeHolder: "22AAAAA0000A1Z5",
      required: true,
      nextFocusField: "panNumber",
      prevFocusField: "gstNumber",
    },
    {
      id: "panNumber",
      type: "text",
      label: "PAN Number",
      placeHolder: "ABCDE1234F",
      required: true,
      prevFocusField: "gstNumber",
      nextFocusField: "registrationNumber",
    },
    {
      id: "registrationNumber",
      type: "text",
      label: "Registration Number",
      placeHolder: "REG2026000123",
      required: true,
      prevFocusField: "panNumber",
      nextFocusField: "industryname",
    }
  ];

  const AdditionalBusinessInformation = [
    {
      id: "industryname",
      type: "selectWrapper",
      label: "Industry",
      placeHolder: "Select Industry",
      nextFocusField: "establishDate",
      options: [
        { label: "Information Technology", value: "IT" },
        { label: "Software & Technology", value: "SOFTWARE" },
        { label: "Banking & Finance", value: "BANKING_FINANCE" },
        { label: "Insurance", value: "INSURANCE" },
        { label: "Healthcare", value: "HEALTHCARE" },
        { label: "Pharmaceuticals", value: "PHARMACEUTICALS" },
        { label: "Manufacturing", value: "MANUFACTURING" },
        { label: "Construction", value: "CONSTRUCTION" },
        { label: "Real Estate", value: "REAL_ESTATE" },
        { label: "Retail", value: "RETAIL" },
        { label: "Wholesale & Distribution", value: "WHOLESALE_DISTRIBUTION" },
        { label: "Education", value: "EDUCATION" },
        { label: "Telecommunications", value: "TELECOMMUNICATIONS" },
        { label: "Transportation & Logistics", value: "TRANSPORTATION_LOGISTICS" },
        { label: "Hospitality & Tourism", value: "HOSPITALITY_TOURISM" },
        { label: "Food & Beverage", value: "FOOD_BEVERAGE" },
        { label: "Automotive", value: "AUTOMOTIVE" },
        { label: "Energy & Utilities", value: "ENERGY_UTILITIES" },
        { label: "Agriculture", value: "AGRICULTURE" },
        { label: "Media & Entertainment", value: "MEDIA_ENTERTAINMENT" },
        { label: "Consulting", value: "CONSULTING" },
        { label: "Legal Services", value: "LEGAL_SERVICES" },
        { label: "Professional Services", value: "PROFESSIONAL_SERVICES" },
        { label: "E-Commerce", value: "E_COMMERCE" },
        { label: "Other", value: "OTHER" },
      ]
    },
    {
      id: "establishDate",
      type: "date",
      label: "Establish Date",
      placeHolder: "ABCDE1234F",
      required: true,
    },
  ];

  const basicInfoSchema = [
    {
      id: "companyName",
      type: "text",
      label: "Company Name",
      placeHolder: "e.g. Acme Corporation",
      required: true,
      nextFocusField: "legalName",
      prevFocusField: 'companyName',
      className: "col-span-3  ",
    },
    {
      id: "legalName",
      type: "text",
      label: "Legal Name",
      placeHolder: "e.g. Acme Corp LLC",
      required: true,
      prevFocusField: "companyName",
      nextFocusField: "companyCode",
      className: "col-span-3  ",
    },
    {
      id: "companyCode",
      type: "text",
      label: "Company Code",
      placeHolder: "e.g. ACM-01",
      required: true,
      prevFocusField: "legalName",
      nextFocusField: "businessEmail",
      className: "col-span-3  ",
    },
    {
      id: "businessEmail",
      type: "text",
      label: "Business Email",
      placeHolder: "admin@company.com",
      required: true,
      prevFocusField: "companyCode",
      nextFocusField: "phone",
      className: "col-span-3  ",
    },
    {
      id: "phone",
      type: "text",
      label: "Phone Number",
      placeHolder: "+1 (555) 000-0000",
      required: true,
      prevFocusField: "businessEmail",
      nextFocusField: "website",
      className: "col-span-3  ",
    },
    {
      id: "website",
      type: "text",
      label: "Website",
      placeHolder: "https://www.company.com",
      required: true,
      prevFocusField: "phone",
      className: "col-span-3  ",
      nextFocusField: "addressLine1",
    },
  ];

  const addressSchema = [
    {
      id: "addressLine1",
      type: "text",
      label: "Address Line 1",
      placeHolder: "Street address, P.O. box, company name",
      required: true,
      nextFocusField: "addressLine2",
      prevFocusField: "website",
      className: "col-span-6",
    },
    {
      id: "addressLine2",
      type: "text",
      label: "Address Line 2 (Optional)",
      placeHolder: "Apartment, suite, unit, building, floor",
      prevFocusField: "addressLine1",
      nextFocusField: "country",
      className: "col-span-6",
    },
    {
      id: "country",
      type: "selectWrapper",
      label: "Country",
      placeHolder: "Select Country",
      api: api + apiEndpoints.master.country.CountryHelp,
      labelKey: "countryName",
      valueKey: "_id",
      required: true,
      prevFocusField: "addressLine2",
      nextFocusField: "state",
    },
    {
      id: "state",
      type: "selectWrapper",
      label: "State / Province",
      placeHolder: "Enter state",
      required: true,
      api: api + apiEndpoints.master.state.StateHelp,
      labelKey: "stateName",
      valueKey: "_id",
      prevFocusField: "country",
      nextFocusField: "city",
    },
    {
      id: "city",
      type: "selectWrapper",
      label: "City",
      placeHolder: "City name",
      required: true,
      api: api + apiEndpoints.master.city.CityHelp,
      labelKey: "cityName",
      valueKey: "_id",
      prevFocusField: "state",
      nextFocusField: "postalCode",
    },
    {
      id: "postalCode",
      type: "text",
      label: "Postal Code",
      placeHolder: "Zip/Postal",
      required: true,
      prevFocusField: "city",
      nextFocusField: "gstNumber",
    },
  ];

  const companyListingColDef = [

    {
      id: "companyName",
      field: "companyName",
      headerName: "Company Name",
      width: 220,
    },
    {
      id: "legalName",
      field: "legalName",
      headerName: "Legal Name",
      width: 160,
    },
    {
      id: "companyCode",
      field: "companyCode",
      headerName: "Company Code",
      width: 120,
    },
    {
      id: "businessEmail",
      field: "businessEmail",
      headerName: "Business Email",
      width: 220,
    },
    {
      id: "phone",
      field: "phone",
      headerName: "Phone",
      width: 160,
    },
    {
      id: "establishDate",
      field: "establishDate",
      headerName: "Establish Date",
      width: 140,
    },
    {
      id: "registrationNumber",
      field: "registrationNumber",
      headerName: "Registration Number",
      width: 180,
    },
    {
      id: "panNumber",
      field: "panNumber",
      headerName: "Pan Number",
      width: 150,
    },
    {
      id: "gstNumber",
      field: "gstNumber",
      headerName: "GST Number",
      width: 190,
    },
    {
      id: "addressLine1",
      field: "addressLine1",
      headerName: "AddressLine1",
      width: 220,
    },
    {
      id: "addressLine2",
      field: "addressLine2",
      headerName: "AddressLine2",
      width: 220,
    },
    {
      id: "countryName",
      field: "countryName",
      headerName: "Country",
      width: 120,
    },
    {
      id: "stateName",
      field: "stateName",
      headerName: "State",
      width: 120,
    },
    {
      id: "cityName",
      field: "cityName",
      headerName: "City",
      width: 120,
    },
    {
      id: "postalCode",
      field: "postalCode",
      headerName: "PostalCode",
      width: 120,
    }, {
      id: "action",
      field: "action",
      headerName: "Action",
      width: 60,
      type: "actions",
      onClick: (data) => {
        handleDelete(data._id);
      }
    }
  ]

  return {
    businessInfoSchema1,
    AdditionalBusinessInformation,
    basicInfoSchema,
    addressSchema,
    companyListingColDef
  };
};

export default useCompanyConfig;
