import React from "react";

const useCompanyConfig = () => {
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

  const businessInfoSchema2 = [
    {
      id: "industryname",
      type: "selectWrapper",
      label: "Industry",
      placeHolder: "Select Industry",
      nextFocusField: "establishDate",
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
      multiSelect: true,
      placeHolder: "Select Country",
      options: [
        { label: "United States", value: "US" },
        { label: "India", value: "IN" },
        { label: "United Kingdom", value: "UK" },
        { label: "Canada", value: "CA" },
      ],
      required: true,
      prevFocusField: "addressLine2",
      nextFocusField: "state",
    },
    {
      id: "state",
      type: "text",
      label: "State / Province",
      placeHolder: "Enter state",
      required: true,
      prevFocusField: "country",
      nextFocusField: "city",
    },
    {
      id: "city",
      type: "text",
      label: "City",
      placeHolder: "City name",
      required: true,
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
      id: "companyid",
      field: "companyid",
      headerName: "Id",
      width: 60,
    },
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
      width: 220,
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
      width: 220,
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
      id: "companySize",
      field: "companySize",
      headerName: "Company Size",
      width: 120,
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
      id: "country",
      field: "country",
      headerName: "Country",
      width: 120,
    },
    {
      id: "state",
      field: "state",
      headerName: "State",
      width: 120,
    },
    {
      id: "city",
      field: "city",
      headerName: "City",
      width: 120,
    },
    {
      id: "postalCode",
      field: "postalCode",
      headerName: "PostalCode",
      width: 120,
    },
  ]

  return {
    businessInfoSchema1,
    businessInfoSchema2,
    basicInfoSchema,
    addressSchema,
    companyListingColDef
  };
};

export default useCompanyConfig;
