// PL Salaried - hide TVR fields
try {
    var loan_type_tvr = record._Loan_Type || la_record._Loan_Product_Type;
    var emp_type_tvr = employment_type;
    if (!emp_type_tvr && applicant_record._Applicants_Type == "Applicant") {
        emp_type_tvr = la_record._Type_of_Employement;
    }

    var pl_salaried = (loan_type_tvr == "Personal Loan" && emp_type_tvr == "Salaried");

    if (pl_salaried) {
        ZDK.UI.getElementByID("bureau_and_banking").setVisibility(false);
    }

    var fields = ["Name_of_Person_Contacted", "Number_of_Years_in_the_Company", "Profession_1",
        "Reporting_Manager", "Reporting_Manager_Mobile_No", "Concerns", "Merits",
        "Any_Salary_Related_Details_Required_If_any", "Any_Cibil_Loans_Details_Required_if_any",
        "Number_of_EMI_Bounces", "Number_of_30_DPDs", "Number_of_Cheque_Bounces", "No_of_Credit_Cards",
        "Any_Loan_Hand_Loan_Gold_Loan_etc", "O_s_of_all_Cards", "Any_Other_Concern_Details_to_be_checked",
        "Any_Banking_Transaction_Details_Required_If_any", "No_of_30_DPDs_Reason",
        "No_of_Cheque_Bounces_Reason", "No_of_EMI_Bounces_Reason", "Existing_Other_Loan_Details"];

    for (var i = 0; i < fields.length; i++) {
        var fld = ZDK.Page.getField(fields[i]);
        if (fld) {
            fld.setVisibility(!pl_salaried);
        }
    }
} catch (e) {
    var param_map = { "details": details, "error_message": e, "action_performed": "> PL Salaried TVR fields hide/show." };
    ZDK.Apps.CRM.Functions.execute("client_script_assistance_error_message", { "triggered_from": "Error_Message", "param_map": encodeURI(JSON.stringify(param_map)) });
}