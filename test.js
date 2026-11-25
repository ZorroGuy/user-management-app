// ===== TVR: hide verification fields for PL Salaried =====
 try {
 var tvr_loan_type = loan_type || Loan_Product_Type;

 var tvr_emp_type = null;
 if (app_type == "Applicant") {
 tvr_emp_type = Type_of_Employement;
 } else if (app_type == "Co-applicant") {
 tvr_emp_type = Co_Applicant_Employment_Type;
 } else if (app_type == "Guarantor") {
 tvr_emp_type = Guarantor_Employment_Type;
 }

 var is_pl_salaried = (tvr_loan_type == "Personal Loan" && tvr_emp_type == "Salaried");
 console.log("app_type:", app_type, "| loan_type:", tvr_loan_type, "| emp_type:", tvr_emp_type, "| is_pl_salaried:", is_pl_salaried);

 var tvr_fields = [
 "Name_of_Person_Contacted",
 "Number_of_Years_in_the_Company",
 "Profession_1",
 "Office_Landline_No",
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
 "Any_Loan_Hand_Loan_Gold_Loan_etc"
 ];

 // Mandatory for all flows except PL Salaried
 var tvr_mandatory_fields = [
 "Name_of_Person_Contacted",
 "Number_of_Years_in_the_Company"
 ];

 tvr_fields.forEach(function (api_name) {
 try {
 var fld = ZDK.Page.getField(api_name);
 if (!fld) {
 console.log("TVR field not found: " + api_name);
 return;
 }
 if (is_pl_salaried) {
 if (tvr_mandatory_fields.indexOf(api_name) > -1) {
 fld.setMandatory(false);
 }
 fld.setVisibility(false);
 } else {
 fld.setVisibility(true);
 if (tvr_mandatory_fields.indexOf(api_name) > -1) {
 fld.setMandatory(true);
 }
 }
 } catch (fe) {
 console.log("Error on field " + api_name + ": " + fe);
 }
 });
 } catch (e) {
 var param_map = { "details": details, "error_message": e, "action_performed": "> PL Salaried TVR fields hide/show." };
 var response = ZDK.Apps.CRM.Functions.execute("client_script_assistance_error_message", { "triggered_from": "Error_Message", "param_map": encodeURI(JSON.stringify(param_map)) });
 }
// ===== END TVR PL Salaried =====