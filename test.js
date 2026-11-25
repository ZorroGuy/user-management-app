            // PL Salaried - hide TVR fields
            try {
                var emp_type = "";
                if (app_type == "Applicant") {
                    emp_type = Type_of_Employement;
                } else if (app_type == "Co-applicant") {
                    emp_type = Co_Applicant_Employment_Type;
                } else if (app_type == "Guarantor") {
                    emp_type = Guarantor_Employment_Type;
                }

                var pl_salaried = (loan_type == "Personal Loan" && emp_type == "Salaried");

                var fields = ["Name_of_Person_Contacted", "Number_of_Years_in_the_Company", "Profession_1", "Office_Landline_No",
                    "Reporting_Manager", "Reporting_Manager_Mobile_No", "Concerns", "Merits",
                    "Any_Salary_Related_Details_Required_If_any", "Any_Cibil_Loans_Details_Required_if_any",
                    "Number_of_EMI_Bounces", "Number_of_30_DPDs", "Number_of_Cheque_Bounces",
                    "No_of_Credit_Cards", "Any_Loan_Hand_Loan_Gold_Loan_etc"];

                for (var i = 0; i < fields.length; i++) {
                    var fld = ZDK.Page.getField(fields[i]);
                    if (fld) {
                        fld.setVisibility(!pl_salaried);
                    }
                }

                ZDK.Page.getField("Name_of_Person_Contacted").setMandatory(!pl_salaried);
                ZDK.Page.getField("Number_of_Years_in_the_Company").setMandatory(!pl_salaried);
            } catch (e) {
                var param_map = { "details": details, "error_message": e, "action_performed": "> PL Salaried TVR fields hide/show." };
                var response = ZDK.Apps.CRM.Functions.execute("client_script_assistance_error_message", { "triggered_from": "Error_Message", "param_map": encodeURI(JSON.stringify(param_map)) });
            }