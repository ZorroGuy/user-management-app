var details = { "From": "Client Script", "Page": "Edit Page (Wizard)", "Module": "TVR", "Layout": "Standard", "Wizard": "TVR", "Event Type": "Wizard Event", "Event": "onLoad" }
try {
    try {
        ZDK.Client.showLoader({ type: 'page', template: 'dot-spinner' });
    } catch (e) {
        var param_map = { "details": details, "error_message": e, "action_performed": "> loader." };
        var response = ZDK.Apps.CRM.Functions.execute("client_script_assistance_error_message", { "triggered_from": "Error_Message", "param_map": encodeURI(JSON.stringify(param_map)) });
        ZDK.Client.showLoader({ type: 'page', template: 'spinner', message: "Loading..." });
    }
    // var save_as_draft_btn = ZDK.Page.getButton('record_save_as_draft');
    // save_as_draft_btn.hide();
    var cancel_btn = ZDK.Page.getButton('record_cancel');
    cancel_btn.hide();
    var TVR_Initiate_Status = ZDK.Page.getField("TVR_Initiate_Status");
    TVR_Initiate_Status.setVisibility(false);

    // Get the current date and time
    let currentDate = new Date();

    // Get the individual components
    let year = currentDate.getFullYear();
    let month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    let day = currentDate.getDate().toString().padStart(2, '0');
    let hours = currentDate.getHours().toString().padStart(2, '0');
    let minutes = currentDate.getMinutes().toString().padStart(2, '0');
    let seconds = currentDate.getSeconds().toString().padStart(2, '0');

    // Format the date and time to "2024-01-17T13:21:00" format
    let formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

    console.log(formattedDateTime);

    ZDK.Page.getField('Request_Date_and_Time').setValue(formattedDateTime);


    ZDK.Page.getField('Request_Date_and_Time').setReadOnly(true);
    ZDK.Page.getField('Request_Submit_Date_and_Time').setReadOnly(true);

    var app_url = $Client.url
    console.log(app_url);
    try {
        ZDK.Page.getComponent('record-create-layout-switch').setVisibility(true);
    } catch (e) {
        var param_map = { "details": details, "error_message": e, "action_performed": "> Condition based hide and show." };
        var response = ZDK.Apps.CRM.Functions.execute("client_script_assistance_error_message", { "triggered_from": "Error_Message", "param_map": encodeURI(JSON.stringify(param_map)) });
    }
    const urlParams = new URLSearchParams(app_url);
    var state = urlParams.get("state");
    console.log(state);

    if (state == 'draft') {


        // var pl_btn = ZDK.UI.getElementByID('WB_Next_4'); // Button1 -WB_Next_4
        // pl_btn.setVisibility(true);
        // var bl_btn = ZDK.UI.getElementByID('WB_Button_3'); // Button3 -WB_Button_3
        // bl_btn.setVisibility(true);
        // var sep_btn = ZDK.UI.getElementByID('WB_Next'); //  Button2-WB_Next
        // sep_btn.setVisibility(true);

        ZDK.Page.getField('Applicant').setReadOnly(true);
        ZDK.Page.getField('Loan_Type').setReadOnly(true);


        if (app_url) {

            // var app_lookup = ZDK.Page.getField('Applicant').getValue();
            // var appid = app_lookup.id;


            var appid = urlParams.get('entityid');

            var leadid = urlParams.get('leadid')
            // if (leadid == "170000003998") {
            ZDK.Page.getField('Name').setValue(leadid);
            ZDK.Page.getField('Name').setReadOnly(true);

            ZDK.Page.getField('Loan_Application_1').setReadOnly(true);

            //New code Start --------------------------------
            try {
                var param_map = { "appid": appid };

                var param_map_str = JSON.stringify(param_map);

                rest_param = { "triggered_from": "TVR.onLoad.TVR_Edit.GET", "param_map": encodeURI(param_map_str) }
                headers = {};

                var response1 = ZDK.Apps.CRM.Functions.execute("Client_Script_Assistance_TVR", rest_param);

                var current_data = response1._details.output;
                console.log(current_data)
                var convert_data = JSON.parse(current_data);

                if (convert_data.error_message == "mismatch id") {
                    console.log("system failed");

                }
                else if (response1._code == "INVALID_DATA") {
                    console.log("system failed")
                }
                else if (convert_data.status == "success") {
                    var AccountID = convert_data.AccountID;
                    var app_type = convert_data.Applicants_Type;
                    var Co_Applicant_Employment_Type = convert_data.Co_Applicant_Employment_Type;
                    var Co_Applicant_Constitution_Type = convert_data.Co_Applicant_Constitution_Type;
                    var Guarantor_Employment_Type = convert_data.Guarantor_Employment_Type;
                    var Guarantor_Constitution_Type = convert_data.Guarantor_Constitution_Type;
                }
                else if (convert_data.status == "failed") {
                    cosole.log("function failed")
                }
            }
            catch (e) {
                var param_map = { "details": details, "error_message": e, "action_performed": "> Values updating." };
                var response = ZDK.Apps.CRM.Functions.execute("client_script_assistance_error_message", { "triggered_from": "Error_Message", "param_map": encodeURI(JSON.stringify(param_map)) });
            }
            //New code End --------------------------------

            console.log("app_type", Applicants_Type);

            // var app_type = applicant._details.statusMessage.data[0].Applicants_Type;


            //New code Start --------------------------------
            try {
                var param_map = { "accid": AccountID };

                var param_map_str = JSON.stringify(param_map);

                rest_param = { "triggered_from": "TVR.onLoad.TVR_Edit.GET.Account", "param_map": encodeURI(param_map_str) }
                headers = {};

                var response1 = ZDK.Apps.CRM.Functions.execute("Client_Script_Assistance_TVR", rest_param);

                var current_data = response1._details.output;
                console.log(current_data)
                var convert_data = JSON.parse(current_data);

                if (convert_data.error_message == "mismatch id") {
                    console.log("system failed");

                }
                else if (response1._code == "INVALID_DATA") {
                    console.log("system failed")
                }
                else if (convert_data.status == "success") {
                    var loan_type = convert_data.Loan_Product_Type;
                    var Requested_Loan_Amount = convert_data.Requested_Loan_Amount;
                    var Source_Branch = convert_data.Source_Branch;
                    var Requested_Tenure_Months = convert_data.Requested_Tenure_Months;
                    var Customer_Type = convert_data.Customer_Type;
                    var Phone = convert_data.Phone;
                    var Mobile_No = convert_data.Mobile_No;
                }
                else if (convert_data.status == "failed") {
                    cosole.log("function failed")
                }
            }
            catch (e) {
                var param_map = { "details": details, "error_message": e, "action_performed": "> Values updating." };
                var response = ZDK.Apps.CRM.Functions.execute("client_script_assistance_error_message", { "triggered_from": "Error_Message", "param_map": encodeURI(JSON.stringify(param_map)) });
            }
            //New code End --------------------------------

            ZDK.Page.getField('Requested_Loan_Amount').setValue(Requested_Loan_Amount);
            ZDK.Page.getField('Requested_Loan_Amount').setReadOnly(true);

            ZDK.Page.getField('Sourcing_Branch').setValue(Source_Branch);
            ZDK.Page.getField('Sourcing_Branch').setReadOnly(true);

            ZDK.Page.getField('Requested_Tenor').setValue(Requested_Tenure_Months);
            ZDK.Page.getField('Requested_Tenor').setReadOnly(true);

            ZDK.Page.getField('Customer_Type').setValue(Customer_Type);
            ZDK.Page.getField('Customer_Type').setReadOnly(true);

            if (app_type == "Applicant") {
                ZDK.Page.getField('Mobile_Number').setValue(Phone);
                ZDK.Page.getField('Mobile_Number').setReadOnly(true);


            }
            else {
                ZDK.Page.getField('Mobile_Number').setValue(Mobile_No);
                ZDK.Page.getField('Mobile_Number').setReadOnly(true);
            }

            //console.log(appusers);

            // CTLZ-35441
            // M Izzath Suhail
            //17/04/2025 start
            var app_no = ZDK.Page.getField('Name').getValue();
            var flag_s = ZDK.Page.getField("Annual_Household_Flag");
            if (app_type == "Applicant") {
                console.log(Loan_Product_Type);
                console.log(Type_of_Employement);
                ZDK.Page.getField("Total_Annual_household_income").setVisibility(false);
                flag_s.setValue(true);
                var st_flag = flag_s.getValue();
                console.log(st_flag);

                if (Loan_Product_Type === "Business Loan" && Type_of_Employement === "Non Sole Proprietor") {
                    ZDK.Page.getField("Total_Annual_household_income").setVisibility(false);
                    ZDK.Page.getField("Spouse_Annual_Income").setVisibility(false);
                    ZDK.Page.getField("Unmarried_children_s_Annual_Income").setVisibility(false);
                    ZDK.Page.getField("Applicant_Annual_Income").setVisibility(false);
                    flag_s.setValue(false);
                    var st_flag = flag_s.getValue();
                    console.log(st_flag);

                }


            }
            else {
                ZDK.Page.getField("Total_Annual_household_income").setVisibility(false);
                ZDK.Page.getField("Spouse_Annual_Income").setVisibility(false);
                ZDK.Page.getField("Unmarried_children_s_Annual_Income").setVisibility(false);
                ZDK.Page.getField("Applicant_Annual_Income").setVisibility(false);
                flag_s.setValue(false);
                var st_flag = flag_s.getValue();
                console.log(st_flag);
            }
            // CTLZ-35441
            // M Izzath Suhail
            //17/04/2025 end

            var user = $Crm.user;
            var user_email = user.email;

            //New code Start --------------------------------
            try {
                var param_map = { "user_email": user_email };

                var param_map_str = JSON.stringify(param_map);

                rest_param = { "triggered_from": "TVR.onLoad.TVR_Edit.GET_Search", "param_map": encodeURI(param_map_str) }
                headers = {};

                var response1 = ZDK.Apps.CRM.Functions.execute("Client_Script_Assistance_TVR", rest_param);

                var current_data = response1._details.output;
                console.log(current_data)
                var convert_data = JSON.parse(current_data);

                if (convert_data.error_message == "mismatch id") {
                    console.log("system failed");

                }
                else if (response1._code == "INVALID_DATA") {
                    console.log("system failed")
                }
                else if (convert_data.status == "success") {
                    var Name = convert_data.Name;
                    var Employee_ID = convert_data.Employee_ID;
                    var Type_of_Employement = convert_data.Type_of_Employement;
                }
                else if (convert_data.status == "failed") {
                    cosole.log("function failed")
                }
            }
            catch (e) {
                var param_map = { "details": details, "error_message": e, "action_performed": "> Values updating." };
                var response = ZDK.Apps.CRM.Functions.execute("client_script_assistance_error_message", { "triggered_from": "Error_Message", "param_map": encodeURI(JSON.stringify(param_map)) });
            }
            //New code End --------------------------------


            ZDK.Page.getField('Employee_Name').setValue(Name);
            ZDK.Page.getField('Employee_Name').setReadOnly(true);


            ZDK.Page.getField('Employee_ID').setValue(Employee_ID);
            ZDK.Page.getField('Employee_ID').setReadOnly(true);

            var coql = { "select_query": "select Eligible_Loan_Amount,Max_Capping_Loan_Amount,Sanctioned_EMI,id,Sanctioned_ROI from Overall_Eligibility where Name=" + leadid + " order by Created_Time desc" };

            // var coql = "select Eligible_Loan_Amount,Max_capping_Loan_amount,EMI,System_Generated_ROI_1,id from In_principle where Name=" + leadid + " order by Created_Time desc"

            // var overall_eligibility = ZDK.Apps.CRM.Connections.invoke("zohocrmall", "https://www.zohoapis.in/crm/v8/coql", "POST", 2, coql, headers);

            // console.log(overall_eligibility);

            // if (overall_eligibility._details.statusMessage.data) {
            // ZDK.Page.getField("Eligible_Loan_Amount").setValue(overall_eligibility._details.statusMessage.data[0].Eligible_Loan_Amount);
            // ZDK.Page.getField("Maximum_Eligible_Loan_Amount").setValue(overall_eligibility._details.statusMessage.data[0].Max_Capping_Loan_Amount);
            // ZDK.Page.getField("EMI").setValue(overall_eligibility._details.statusMessage.data[0].Sanctioned_EMI);
            // ZDK.Page.getField("ROI").setValue(overall_eligibility._details.statusMessage.data[0].Sanctioned_ROI);

            // ZDK.Page.getField("Eligible_Loan_Amount").setReadOnly(true);
            // ZDK.Page.getField("Maximum_Eligible_Loan_Amount").setReadOnly(true);
            // ZDK.Page.getField("EMI").setReadOnly(true);
            // ZDK.Page.getField("ROI").setReadOnly(true);
            // ZDK.Page.getField("Employee_Type").setReadOnly(true);
            // }
            if (app_type == "Applicant") {

                if (loan_type == "Personal Loan") {
                    if (Type_of_Employement == "Salaried") {
                        // var pl_btn = ZDK.UI.getElementByID('WB_Next_4');
                        // pl_btn.setVisibility(true);
                        ZDK.Page.getField('Button').setValue('Button1');
                        ZDK.Client.hideLoader(); return
                    }
                    if (Type_of_Employement == "Self Employed Non Professional") {
                        // var bl_btn = ZDK.UI.getElementByID('WB_Button_3');
                        // bl_btn.setVisibility(true);
                        ZDK.Page.getField('Button').setValue('Button3');
                        try {
                            if (ZDK.Page.getField("Constitution_Type")) {
                                ZDK.Page.getField("Constitution_Type").setVisibility(true);
                            }
                            if (ZDK.Page.getField("For_Non_Sole_detail_of_all_share_holders")) {
                                ZDK.Page.getField("For_Non_Sole_detail_of_all_share_holders").setVisibility(true);
                            }
                        } catch (e) {
                            var param_map = { "details": details, "error_message": e, "action_performed": "> Values updating." };
                            var response = ZDK.Apps.CRM.Functions.execute("client_script_assistance_error_message", { "triggered_from": "Error_Message", "param_map": encodeURI(JSON.stringify(param_map)) });
                        }
                        ZDK.Client.hideLoader(); return
                    }

                }
                if (loan_type == "Business Loan") {
                    // var bl_btn = ZDK.UI.getElementByID('WB_Button_3');
                    // bl_btn.setVisibility(true);
                    ZDK.Page.getField('Button').setValue('Button3');
                    ZDK.Client.hideLoader(); return
                }
                if (loan_type == "Professional Loan") {
                    // var sep_btn = ZDK.UI.getElementByID('WB_Next');
                    // sep_btn.setVisibility(true);
                    ZDK.Page.getField('Button').setValue('Button2')
                    ZDK.Client.hideLoader(); return

                }

            }
            if (app_type == "Co-applicant") {
                if (Co_Applicant_Employment_Type == "Salaried") {
                    // var pl_btn = ZDK.UI.getElementByID('WB_Next_4');
                    // pl_btn.setVisibility(true);
                    ZDK.Page.getField('Button').setValue('Button1');
                    ZDK.Client.hideLoader(); return
                }

                if (Co_Applicant_Employment_Type != "Salaried" && Co_Applicant_Employment_Type != "Self Employed Professional" && Co_Applicant_Employment_Type != null) {
                    // var bl_btn = ZDK.UI.getElementByID('WB_Button_3');
                    // bl_btn.setVisibility(true);
                    ZDK.Page.getField('Button').setValue('Button3');
                    try {
                        if (ZDK.Page.getField("Constitution_Type")) {
                            ZDK.Page.getField("Constitution_Type").setVisibility(true);
                        }
                        if (ZDK.Page.getField("For_Non_Sole_detail_of_all_share_holders")) {
                            ZDK.Page.getField("For_Non_Sole_detail_of_all_share_holders").setVisibility(true);
                        }
                    } catch (e) {
                        var param_map = { "details": details, "error_message": e, "action_performed": "> Values updating." };
                        var response = ZDK.Apps.CRM.Functions.execute("client_script_assistance_error_message", { "triggered_from": "Error_Message", "param_map": encodeURI(JSON.stringify(param_map)) });
                    }
                    ZDK.Client.hideLoader(); return
                }

                if (Co_Applicant_Employment_Type == "Self Employed Professional") {
                    // var sep_btn = ZDK.UI.getElementByID('WB_Next');
                    // sep_btn.setVisibility(true);
                    ZDK.Page.getField('Button').setValue('Button2')
                    ZDK.Client.hideLoader(); return
                }

                if (Co_Applicant_Constitution_Type == "Sole Proprietor") {
                    // var bl_btn = ZDK.UI.getElementByID('WB_Button_3');
                    // bl_btn.setVisibility(true);
                    ZDK.Page.getField('Button').setValue('Button3');
                    ZDK.Client.hideLoader(); return
                }

                if (Co_Applicant_Constitution_Type != "Sole Proprietor" && Co_Applicant_Constitution_Type != null) {
                    // var bl_btn = ZDK.UI.getElementByID('WB_Button_3');
                    // bl_btn.setVisibility(true);
                    ZDK.Page.getField('Button').setValue('Button3');
                    ZDK.Client.hideLoader(); return
                }


            }
            if (app_type == "Guarantor") {
                if (Guarantor_Employment_Type == "Salaried") {
                    // var pl_btn = ZDK.UI.getElementByID('WB_Next_4');
                    // pl_btn.setVisibility(true);
                    ZDK.Page.getField('Button').setValue('Button1');
                    ZDK.Client.hideLoader(); return
                }

                if (Guarantor_Employment_Type != "Salaried" && Guarantor_Employment_Type != "Self Employed Professional" && Guarantor_Employment_Type != null) {
                    // var bl_btn = ZDK.UI.getElementByID('WB_Button_3');
                    // bl_btn.setVisibility(true);
                    ZDK.Page.getField('Button').setValue('Button3');
                    try {
                        if (ZDK.Page.getField("Constitution_Type")) {
                            ZDK.Page.getField("Constitution_Type").setVisibility(true);
                        }
                        if (ZDK.Page.getField("For_Non_Sole_detail_of_all_share_holders")) {
                            ZDK.Page.getField("For_Non_Sole_detail_of_all_share_holders").setVisibility(true);
                        }
                    } catch (e) {
                        var param_map = { "details": details, "error_message": e, "action_performed": "> Values updating." };
                        var response = ZDK.Apps.CRM.Functions.execute("client_script_assistance_error_message", { "triggered_from": "Error_Message", "param_map": encodeURI(JSON.stringify(param_map)) });
                    }
                    ZDK.Client.hideLoader(); return
                }

                if (Guarantor_Employment_Type == "Self Employed Professional") {
                    // var sep_btn = ZDK.UI.getElementByID('WB_Next');
                    // sep_btn.setVisibility(true);
                    ZDK.Page.getField('Button').setValue('Button2')
                    ZDK.Client.hideLoader(); return
                }


                if (Guarantor_Constitution_Type == "Sole Proprietor") {
                    // var bl_btn = ZDK.UI.getElementByID('WB_Button_3');
                    // bl_btn.setVisibility(true);
                    ZDK.Page.getField('Button').setValue('Button3');
                    ZDK.Client.hideLoader(); return
                }

                if (Guarantor_Constitution_Type != "Sole Proprietor" && Guarantor_Constitution_Type != null) {
                    // var bl_btn = ZDK.UI.getElementByID('WB_Button_3');
                    // bl_btn.setVisibility(true);
                    ZDK.Page.getField('Button').setValue('Button3');
                    ZDK.Client.hideLoader(); return
                }
            }

            // if ($Page.record_id == 419602000033564293)
            // {
            //     ZDK.Page.getField('Button').setValue('Button1');
            //    ZDK.Page.getField('Button').setValue('Button2');
            //    ZDK.Page.getField('Button').setValue('Button3');
            // }

        }
        // }
    }
    else {
        ZDK.Page.getField('Name').setReadOnly(true);
        ZDK.Page.getField('Applicant').setReadOnly(true);
        ZDK.Page.getField('Loan_Type').setReadOnly(true);
        ZDK.Page.getField('Loan_Application_1').setReadOnly(true);
        ZDK.Page.getField('Requested_Loan_Amount').setReadOnly(true);
        ZDK.Page.getField('Sourcing_Branch').setReadOnly(true);
        ZDK.Page.getField('Requested_Tenor').setReadOnly(true);
        ZDK.Page.getField('Customer_Type').setReadOnly(true);
        ZDK.Page.getField('Mobile_Number').setReadOnly(true);
        ZDK.Page.getField('Employee_Name').setReadOnly(true);
        ZDK.Page.getField('Employee_ID').setReadOnly(true);
    }

    // ===== TVR: hide verification  PL Salaried =====
    try {
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

        // Pick the employment type based on who this TVR is for
        var tvr_emp_type = null;
        if (app_type == "Applicant") {
            tvr_emp_type = Type_of_Employement;
        } else if (app_type == "Co-applicant") {
            tvr_emp_type = Co_Applicant_Employment_Type;
        } else if (app_type == "Guarantor") {
            tvr_emp_type = Guarantor_Employment_Type;
        }

        var is_pl_salaried = (loan_type == "Personal Loan" && tvr_emp_type == "Salaried");
        console.log("is_pl_salaried: " + is_pl_salaried);

        tvr_fields.forEach(function (api_name) {
            try {
                var fld = ZDK.Page.getField(api_name);
                if (!fld) {
                    console.log("TVR field not found: " + api_name);
                    return;
                }
                if (is_pl_salaried) {
                    // Remove mandatory first, then hide
                    if (tvr_mandatory_fields.indexOf(api_name) > -1) {
                        fld.setMandatory(false);
                    }
                    fld.setVisibility(false);
                } else {
                    // Show first, then make mandatory
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
    // ===== END =====

} catch (e) {
    var param_map = { "details": details, "error_message": e, "action_performed": "> Overall catch." };
    var response = ZDK.Apps.CRM.Functions.execute("client_script_assistance_error_message", { "triggered_from": "Error_Message", "param_map": encodeURI(JSON.stringify(param_map)) });
}
ZDK.Client.hideLoader();
