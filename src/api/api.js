const api = import.meta.env.VITE_API_URL || "http://localhost:8080";

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
        },
        getEmployee: "/employee/getEmployee",
        addEditEmployee: "/employee/addEditEmployee",
        deleteEmployee: "/employee/deleteEmployeeById",
        getEmployeeById: "/employee/getEmployeeById",
        getEmployeeHelp: "/employee/getEmployeeHelp",
        asset: {
            AssetAddEdit: "/employee/asset/addEditAsset",
            AssetGetData: "/employee/asset/getAsset",
            AssetDeleteByID: "/employee/asset/deleteAssetById",
            AssetGetByID: "/employee/asset/getAssetById",
            AssetHelp: "/employee/asset/getAssetHelp",
            AssetsByEmployee: "/employee/asset/getAssetsByEmployee",
        },
        exit: {
            ExitAddEdit: "/employee/exit/addEditExit",
            ExitGetData: "/employee/exit/getExit",
            ExitDeleteByID: "/employee/exit/deleteExitById",
            ExitGetByID: "/employee/exit/getExitById",
        },
    },

    tasks: {
        getTasks: "/tasks/getTasks",
        getAssignableEmployees: "/tasks/getAssignableEmployees",
        createTask: "/tasks/createTask",
        updateTaskStatus: "/tasks/updateTaskStatus",
        getProjects: "/tasks/getProjects",
        addEditProject: "/tasks/addEditProject",
        deleteProject: "/tasks/deleteProject",
        deleteTask: "/tasks/deleteTask",
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
    
    recruitment: {
        jobOpening: {
            JobOpeningAddEdit: "/recruitment/jobopening/addEditJobOpening",
            JobOpeningGetData: "/recruitment/jobopening/getJobOpening",
            JobOpeningDeleteByID: "/recruitment/jobopening/deleteJobOpeningById",
            JobOpeningGetByID: "/recruitment/jobopening/getJobOpeningById",
            JobOpeningHelp: "/recruitment/jobopening/getJobOpeningHelp",
        },
        candidate: {
            CandidateAddEdit: "/recruitment/candidate/addEditCandidate",
            CandidateGetData: "/recruitment/candidate/getCandidates",
            CandidateDeleteByID: "/recruitment/candidate/deleteCandidateById",
            CandidateGetByID: "/recruitment/candidate/getCandidateById",
            CandidateHelp: "/recruitment/candidate/getCandidateHelp",
        },
        interview: {
            InterviewAddEdit: "/recruitment/interview/addEditInterview",
            InterviewGetData: "/recruitment/interview/getInterviews",
            InterviewDeleteByID: "/recruitment/interview/deleteInterviewById",
            InterviewGetByID: "/recruitment/interview/getInterviewById",
        },
        offer: {
            OfferAddEdit: "/recruitment/offer/addEditOfferLetter",
            OfferGetData: "/recruitment/offer/getOfferLetters",
            OfferDeleteByID: "/recruitment/offer/deleteOfferLetterById",
            OfferGetByID: "/recruitment/offer/getOfferLetterById",
        },
        onboarding: {
            OnboardingAddEdit: "/recruitment/onboarding/addEditOnboarding",
            OnboardingGetData: "/recruitment/onboarding/getOnboarding",
            OnboardingDeleteByID: "/recruitment/onboarding/deleteOnboardingById",
            OnboardingGetByID: "/recruitment/onboarding/getOnboardingById",
        },
    },

    attendance: {
        log: {
            LogAddEdit: "/attendance/log/addEditAttendanceLog",
            LogGetData: "/attendance/log/getAttendanceLogs",
            LogDeleteByID: "/attendance/log/deleteAttendanceLogById",
            LogGetByID: "/attendance/log/getAttendanceLogById",
        },
        shift: {
            ShiftAddEdit: "/attendance/shift/addEditShift",
            ShiftGetData: "/attendance/shift/getShifts",
            ShiftDeleteByID: "/attendance/shift/deleteShiftById",
            ShiftGetByID: "/attendance/shift/getShiftById",
            ShiftHelp: "/attendance/shift/getShiftHelp",
        },
        request: {
            RequestAddEdit: "/attendance/request/addEditAttendanceRequest",
            RequestGetData: "/attendance/request/getAttendanceRequests",
            RequestDeleteByID: "/attendance/request/deleteAttendanceRequestById",
            RequestGetByID: "/attendance/request/getAttendanceRequestById",
        },
    },

    leave: {
        type: {
            TypeAddEdit: "/leave/type/addEditLeaveType",
            TypeGetData: "/leave/type/getLeaveTypes",
            TypeDeleteByID: "/leave/type/deleteLeaveTypeById",
            TypeGetByID: "/leave/type/getLeaveTypeById",
            TypeHelp: "/leave/type/getLeaveTypeHelp",
        },
        policy: {
            PolicyAddEdit: "/leave/policy/addEditLeavePolicy",
            PolicyGetData: "/leave/policy/getLeavePolicies",
            PolicyDeleteByID: "/leave/policy/deleteLeavePolicyById",
            PolicyGetByID: "/leave/policy/getLeavePolicyById",
        },
        request: {
            RequestAddEdit: "/leave/request/addEditLeaveRequest",
            RequestGetData: "/leave/request/getLeaveRequests",
            RequestDeleteByID: "/leave/request/deleteLeaveRequestById",
            RequestGetByID: "/leave/request/getLeaveRequestById",
        },
        approval: {
            UpdateRequestStatus: "/leave/approval/updateLeaveRequestStatus",
        },
        balance: {
            BalanceAddEdit: "/leave/balance/addEditLeaveBalance",
            BalanceGetData: "/leave/balance/getLeaveBalances",
            BalanceDeleteByID: "/leave/balance/deleteLeaveBalanceById",
            BalanceGetByID: "/leave/balance/getLeaveBalanceById",
        },
    },

    payroll: {
        salaryStructure: {
            StructureAddEdit: "/payroll/salary-structure/addEditSalaryStructure",
            StructureGetData: "/payroll/salary-structure/getSalaryStructures",
            StructureDeleteByID: "/payroll/salary-structure/deleteSalaryStructureById",
            StructureGetByID: "/payroll/salary-structure/getSalaryStructureById",
            StructureHelp: "/payroll/salary-structure/getSalaryStructureHelp",
        },
        process: {
            ProcessAddEdit: "/payroll/process/addEditPayrollProcess",
            ProcessGetData: "/payroll/process/getPayrollProcesses",
            ProcessDeleteByID: "/payroll/process/deletePayrollProcessById",
            ProcessGetByID: "/payroll/process/getPayrollProcessById",
        },
        payslip: {
            PayslipAddEdit: "/payroll/payslip/addEditPayslip",
            PayslipGetData: "/payroll/payslip/getPayslips",
            PayslipDeleteByID: "/payroll/payslip/deletePayslipById",
            PayslipGetByID: "/payroll/payslip/getPayslipById",
        },
        loan: {
            LoanAddEdit: "/payroll/loan/addEditLoan",
            LoanGetData: "/payroll/loan/getLoans",
            LoanDeleteByID: "/payroll/loan/deleteLoanById",
            LoanGetByID: "/payroll/loan/getLoanById",
        },
        reimbursement: {
            ReimbursementAddEdit: "/payroll/reimbursement/addEditReimbursement",
            ReimbursementGetData: "/payroll/reimbursement/getReimbursements",
            ReimbursementDeleteByID: "/payroll/reimbursement/deleteReimbursementById",
            ReimbursementGetByID: "/payroll/reimbursement/getReimbursementById",
        },
        tax: {
            TaxAddEdit: "/payroll/tax/addEditTaxDeclaration",
            TaxGetData: "/payroll/tax/getTaxDeclarations",
            TaxDeleteByID: "/payroll/tax/deleteTaxDeclarationById",
            TaxGetByID: "/payroll/tax/getTaxDeclarationById",
        },
    },

    performance: {
        goal: {
            GoalAddEdit: "/performance/goal/addEditGoal",
            GoalGetData: "/performance/goal/getGoals",
            GoalDeleteByID: "/performance/goal/deleteGoalById",
            GoalGetByID: "/performance/goal/getGoalById",
        },
        review: {
            ReviewAddEdit: "/performance/review/addEditReview",
            ReviewGetData: "/performance/review/getReviews",
            ReviewDeleteByID: "/performance/review/deleteReviewById",
            ReviewGetByID: "/performance/review/getReviewById",
        },
        appraisal: {
            AppraisalAddEdit: "/performance/appraisal/addEditAppraisal",
            AppraisalGetData: "/performance/appraisal/getAppraisals",
            AppraisalDeleteByID: "/performance/appraisal/deleteAppraisalById",
            AppraisalGetByID: "/performance/appraisal/getAppraisalById",
        },
        feedback: {
            FeedbackAddEdit: "/performance/feedback/addEditFeedback",
            FeedbackGetData: "/performance/feedback/getFeedbacks",
            FeedbackDeleteByID: "/performance/feedback/deleteFeedbackById",
            FeedbackGetByID: "/performance/feedback/getFeedbackById",
        },
    },

    administration: {
        user: {
            UserAddEdit: "/administration/user/addEditUser",
            UserGetData: "/administration/user/getUsers",
            UserDeleteByID: "/administration/user/deleteUserById",
            UserGetByID: "/administration/user/getUserById",
        },
        role: {
            RoleAddEdit: "/administration/role/addEditRole",
            RoleGetData: "/administration/role/getRoles",
            RoleDeleteByID: "/administration/role/deleteRoleById",
            RoleGetByID: "/administration/role/getRoleById",
            RoleHelp: "/administration/role/getRoleHelp",
            RolePermissionsUpdate: "/administration/role/updateRolePermissions",
        },
        audit: {
            AuditGetData: "/administration/audit/getAuditLogs",
            AuditCreate: "/administration/audit/createAuditLog",
        },
    },

    settings: {
        system: {
            GetByCategory: "/settings/system/getSettingsByCategory",
            UpdateByCategory: "/settings/system/updateSettingsByCategory",
        },
    },

    auth: {
        login: "/auth/login",
        me: "/auth/me",
    },

    menu: {
        MenuAddEdit: "/master/menu/addEditMenu",
        MenuGetData: "/master/menu/getMenus",
        MenuDeleteByID: "/master/menu/deleteMenuById",
        MenuGetByID: "/master/menu/getMenuById",
        MenuHelp: "/master/menu/getMenuHelp",
    },

    dashboard: {
        stats: "/dashboard/getDashboardStats",
        recentActivities: "/dashboard/getRecentActivities",
    },

    common: {
        imageUpload: "/api/imageupload"
    },

    // Entity shortcuts
    shift: {
        getShift: "/attendance/shift/getShifts",
        addEditShift: "/attendance/shift/addEditShift",
        deleteShift: "/attendance/shift/deleteShiftById",
        getShiftById: "/attendance/shift/getShiftById",
        getShiftHelp: "/attendance/shift/getShiftHelp",
    },
    attendanceLog: {
        getAttendanceLog: "/attendance/log/getAttendanceLogs",
        addEditAttendanceLog: "/attendance/log/addEditAttendanceLog",
        deleteAttendanceLog: "/attendance/log/deleteAttendanceLogById",
        getAttendanceLogById: "/attendance/log/getAttendanceLogById",
    },
    attendanceRequest: {
        getAttendanceRequest: "/attendance/request/getAttendanceRequests",
        addEditAttendanceRequest: "/attendance/request/addEditAttendanceRequest",
        deleteAttendanceRequest: "/attendance/request/deleteAttendanceRequestById",
        getAttendanceRequestById: "/attendance/request/getAttendanceRequestById",
    },
    leaveType: {
        getLeaveType: "/leave/type/getLeaveTypes",
        addEditLeaveType: "/leave/type/addEditLeaveType",
        deleteLeaveType: "/leave/type/deleteLeaveTypeById",
        getLeaveTypeById: "/leave/type/getLeaveTypeById",
        getLeaveTypeHelp: "/leave/type/getLeaveTypeHelp",
    },
    leavePolicy: {
        getLeavePolicy: "/leave/policy/getLeavePolicies",
        addEditLeavePolicy: "/leave/policy/addEditLeavePolicy",
        deleteLeavePolicy: "/leave/policy/deleteLeavePolicyById",
        getLeavePolicyById: "/leave/policy/getLeavePolicyById",
    },
    leaveRequest: {
        getLeaveRequest: "/leave/request/getLeaveRequests",
        addEditLeaveRequest: "/leave/request/addEditLeaveRequest",
        deleteLeaveRequest: "/leave/request/deleteLeaveRequestById",
        getLeaveRequestById: "/leave/request/getLeaveRequestById",
    },
    leaveBalance: {
        getLeaveBalance: "/leave/balance/getLeaveBalances",
        addEditLeaveBalance: "/leave/balance/addEditLeaveBalance",
        deleteLeaveBalance: "/leave/balance/deleteLeaveBalanceById",
        getLeaveBalanceById: "/leave/balance/getLeaveBalanceById",
    },
    salaryStructure: {
        getSalaryStructure: "/payroll/salary-structure/getSalaryStructures",
        addEditSalaryStructure: "/payroll/salary-structure/addEditSalaryStructure",
        deleteSalaryStructure: "/payroll/salary-structure/deleteSalaryStructureById",
        getSalaryStructureById: "/payroll/salary-structure/getSalaryStructureById",
        getSalaryStructureHelp: "/payroll/salary-structure/getSalaryStructureHelp",
    },
    payrollProcess: {
        getPayrollProcess: "/payroll/process/getPayrollProcesses",
        addEditPayrollProcess: "/payroll/process/addEditPayrollProcess",
        deletePayrollProcess: "/payroll/process/deletePayrollProcessById",
        getPayrollProcessById: "/payroll/process/getPayrollProcessById",
    },
    payslip: {
        getPayslip: "/payroll/payslip/getPayslips",
        addEditPayslip: "/payroll/payslip/addEditPayslip",
        deletePayslip: "/payroll/payslip/deletePayslipById",
        getPayslipById: "/payroll/payslip/getPayslipById",
    },
    loan: {
        getLoan: "/payroll/loan/getLoans",
        addEditLoan: "/payroll/loan/addEditLoan",
        deleteLoan: "/payroll/loan/deleteLoanById",
        getLoanById: "/payroll/loan/getLoanById",
    },
    reimbursement: {
        getReimbursement: "/payroll/reimbursement/getReimbursements",
        addEditReimbursement: "/payroll/reimbursement/addEditReimbursement",
        deleteReimbursement: "/payroll/reimbursement/deleteReimbursementById",
        getReimbursementById: "/payroll/reimbursement/getReimbursementById",
    },
    taxManagement: {
        getTaxManagement: "/payroll/tax/getTaxDeclarations",
        addEditTaxManagement: "/payroll/tax/addEditTaxDeclaration",
        deleteTaxManagement: "/payroll/tax/deleteTaxDeclarationById",
        getTaxManagementById: "/payroll/tax/getTaxDeclarationById",
    },
    goal: {
        getGoal: "/performance/goal/getGoals",
        addEditGoal: "/performance/goal/addEditGoal",
        deleteGoal: "/performance/goal/deleteGoalById",
        getGoalById: "/performance/goal/getGoalById",
    },
    review: {
        getReview: "/performance/review/getReviews",
        addEditReview: "/performance/review/addEditReview",
        deleteReview: "/performance/review/deleteReviewById",
        getReviewById: "/performance/review/getReviewById",
    },
    appraisal: {
        getAppraisal: "/performance/appraisal/getAppraisals",
        addEditAppraisal: "/performance/appraisal/addEditAppraisal",
        deleteAppraisal: "/performance/appraisal/deleteAppraisalById",
        getAppraisalById: "/performance/appraisal/getAppraisalById",
    },
    feedback: {
        getFeedback: "/performance/feedback/getFeedbacks",
        addEditFeedback: "/performance/feedback/addEditFeedback",
        deleteFeedback: "/performance/feedback/deleteFeedbackById",
        getFeedbackById: "/performance/feedback/getFeedbackById",
    },
    candidate: {
        getCandidate: "/recruitment/candidate/getCandidates",
        addEditCandidate: "/recruitment/candidate/addEditCandidate",
        deleteCandidate: "/recruitment/candidate/deleteCandidateById",
        getCandidateById: "/recruitment/candidate/getCandidateById",
        getCandidateHelp: "/recruitment/candidate/getCandidateHelp",
    },
    interview: {
        getInterview: "/recruitment/interview/getInterviews",
        addEditInterview: "/recruitment/interview/addEditInterview",
        deleteInterview: "/recruitment/interview/deleteInterviewById",
        getInterviewById: "/recruitment/interview/getInterviewById",
    },
    offerLetter: {
        getOfferLetter: "/recruitment/offer/getOfferLetters",
        addEditOfferLetter: "/recruitment/offer/addEditOfferLetter",
        deleteOfferLetter: "/recruitment/offer/deleteOfferLetterById",
        getOfferLetterById: "/recruitment/offer/getOfferLetterById",
    },
    onboarding: {
        getOnboarding: "/recruitment/onboarding/getOnboarding",
        addEditOnboarding: "/recruitment/onboarding/addEditOnboarding",
        deleteOnboarding: "/recruitment/onboarding/deleteOnboardingById",
        getOnboardingById: "/recruitment/onboarding/getOnboardingById",
    },
    user: {
        getUser: "/administration/user/getUsers",
        addEditUser: "/administration/user/addEditUser",
        deleteUser: "/administration/user/deleteUserById",
        getUserById: "/administration/user/getUserById",
    },
    role: {
        getRole: "/administration/role/getRoles",
        addEditRole: "/administration/role/addEditRole",
        deleteRole: "/administration/role/deleteRoleById",
        getRoleById: "/administration/role/getRoleById",
        getRoleHelp: "/administration/role/getRoleHelp",
        RoleGetData: "/administration/role/getRoles",
        RoleAddEdit: "/administration/role/addEditRole",
        RoleDeleteByID: "/administration/role/deleteRoleById",
        RoleGetByID: "/administration/role/getRoleById",
        RoleHelp: "/administration/role/getRoleHelp",
    },
    auditLog: {
        getAuditLog: "/administration/audit/getAuditLogs",
        addEditAuditLog: "/administration/audit/createAuditLog",
    },
    systemSetting: {
        getSystemSetting: "/settings/system/getSettingsByCategory",
        addEditSystemSetting: "/settings/system/updateSettingsByCategory",
    },
    holiday: {
        getHoliday: "/master/holiday/getHoliday",
        addEditHoliday: "/master/holiday/addEditHoliday",
        deleteHoliday: "/master/holiday/deleteHolidayById",
        getHolidayById: "/master/holiday/getHolidayById",
        getHolidayHelp: "/master/holiday/getHolidayHelp",
    },
    auth: {
        login: "/auth/login",
        me: "/auth/me",
    },
    menu: {
        MenuGetData: "/administration/menu/getMenus",
        MenuGetByID: "/administration/menu/getMenuById",
        MenuAddEdit: "/administration/menu/addEditMenu",
        MenuDeleteByID: "/administration/menu/deleteMenuById",
        MenuHelp: "/administration/menu/getMenuHelp",
        MenuTree: "/administration/menu/getMenuTree",
        MenuSeed: "/administration/menu/seedDefaults",
    },
    administration: {
        role: {
            RoleGetData: "/administration/role/getRoles",
            RoleAddEdit: "/administration/role/addEditRole",
            RoleDeleteByID: "/administration/role/deleteRoleById",
            RoleGetByID: "/administration/role/getRoleById",
            RoleHelp: "/administration/role/getRoleHelp",
        },
    },
};

export { api, apiEndpoints };