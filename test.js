// ===== TVR: hide verification fields for PL Salaried =====
try {
    var tvr_loan_type = record._Loan_Type || la_record._Loan_Product_Type;
    var tvr_emp_type = employment_type;      
    if (!tvr_emp_type && applicant_record._Applicants_Type === "Applicant") {
        tvr_emp_type = la_record._Type_of_Employement; 
    }
    var is_pl_salaried = (tvr_loan_type == "Personal Loan" && tvr_emp_type == "Salaried");
    console.log("TVR loan_type:", tvr_loan_type, "| emp_type:", tvr_emp_type, "| is_pl_salaried:", is_pl_salaried);

    if (is_pl_salaried)
    {
        ZDK.UI.getElementByID("bureau_and_banking").setVisibility(false);
    } 
 
    // 
    var tvr_field_elements = [
        "Name_of_Person_Contacted",
        "Number_of_Years_in_the_Company",
        "Profession_1",
        "Reporting_Manager",
        "Reporting_Manager_Mobile_No",
        "Concerns",
        "Merits",
        "Any_Salary_Related_Details_Required_If_any",
        "Any_Cibil_Loans_Details_Required_if_any",
        "Number_of_EMI_Bounces",
        "Number_of_30_DPDs",
        "Number_of_Cheque_Bounces",
        "No_of_Credit_Cards",
        "Any_Loan_Hand_Loan_Gold_Loan_etc",
        "O_s_of_all_Cards",
        "Any_Other_Concern_Details_to_be_checked",
        "Any_Banking_Transaction_Details_Required_If_any",
        "No_of_30_DPDs_Reason",
        "No_of_Cheque_Bounces_Reason",
        "No_of_EMI_Bounces_Reason",
        "Existing_Other_Loan_Details"
    ];

    tvr_field_elements.forEach(function (el_id) {
        try {
            var el = ZDK.Page.getField(el_id);
            el.setVisibility(!is_pl_salaried);
        } catch (fe) {
            console.log("TVR element error " + el_id + ": " + fe);
        }
    });

} catch (e) {
    var param_map = { "details": details, "error_message": e, "action_performed": "> PL Salaried TVR fields hide/show." };
    ZDK.Apps.CRM.Functions.execute("client_script_assistance_error_message", { "triggered_from": "Error_Message", "param_map": encodeURI(JSON.stringify(param_map)) });
}
// ===== END =====
