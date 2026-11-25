console.log("onLoad");
var details = { "From": "Client Script", "Page": "Create Page (Wizard)", "Module": "TVR", "Layout": "Standard", "Wizard": "TVR", "Event Type": "Wizard Event", "Event": "onLoad" }
try {

    try {
        ZDK.Client.showLoader({ type: 'page', template: 'dot-spinner' })
    } catch (e) {
        var param_map = { "details": details, "error_message": e, "action_performed": "> loader." };
        var response = ZDK.Apps.CRM.Functions.execute("client_script_assistance_error_message", { "triggered_from": "Error_Message", "param_map": encodeURI(JSON.stringify(param_map)) });
        ZDK.Client.showLoader({ type: 'page', template: 'spinner', message: "Loading..." });
    }
    // ZDK.Client.showLoader({ type: 'page', template: 'spinner', message: 'Loading ...' });
    var save_as_draft_btn = ZDK.Page.getButton('record_save_as_draft');
    save_as_draft_btn.hide();
    var cancel_btn = ZDK.Page.getButton('record_cancel');
    cancel_btn.hide();
    var TVR_Initiate_Status = ZDK.Page.getField("TVR_Initiate_Status");
    TVR_Initiate_Status.setVisibility(false);
    // M Izzath Suhail GCP call in Transition start 1
    ZDK.Page.getField('AI_Generated_Audio_Insights').setReadOnly(true);
    // M Izzath Suhail GCP call in Transition end 1
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
    let formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;;

    console.log(formattedDateTime);

    ZDK.Page.getField('Request_Date_and_Time').setValue(formattedDateTime);


    ZDK.Page.getField('Request_Date_and_Time').setReadOnly(true);
    ZDK.Page.getField('Request_Submit_Date_and_Time').setReadOnly(true);


    var app_url = $Client.url
    try {
        ZDK.Page.getComponent('record-create-layout-switch').setVisibility(true);
    } catch (e) {
        var param_map = { "details": details, "error_message": e, "action_performed": "> Condition based fields hide and show." };
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

            var app_lookup = ZDK.Page.getField('Applicant').getValue();
            var appid = app_lookup.id;


            // var appid = urlParams.get('entityid');

            var leadid = ZDK.Page.getField('Name').getValue();
            // if (leadid == "170000003998") {
            ZDK.Page.getField('Name').setReadOnly(true);

            ZDK.Page.getField('Loan_Application_1').setReadOnly(true);
            //New code Start --------------------------------
            try {
                var param_map = { "app_id": appid };

                var param_map_str = JSON.stringify(param_map);

                rest_param = { "triggered_from": "TVR.OnLoad.TVR_onload.GET", "param_map": encodeURI(param_map_str) }
                headers = {};

                var response1 = ZDK.Apps.CRM.Functions.execute("Client_Script_Assistance_TVR", rest_param);

                var current_data = response1._details.output;
                console.log(current_data)
                var convert_data = JSON.parse(current_data);
                console.log(convert_data)

                if (convert_data.error_message == "mismatch id") {
                    console.log("system failed");

                }
                else if (response1._code == "INVALID_DATA") {
                    console.log("system failed")
                }
                else if (convert_data.status == "success") {
                    var Applicants_Type = convert_data.Applicants_Type;
                    var Account_Name_id = convert_data.Account_Name_id;
                    var Mobile_No = convert_data.Mobile_No;
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
                var param_map = { "details": details, "error_message": e, "action_performed": "> Values getting." };
                var response = ZDK.Apps.CRM.Functions.execute("client_script_assistance_error_message", { "triggered_from": "Error_Message", "param_map": encodeURI(JSON.stringify(param_map)) });
            }
            //New code End --------------------------------

            var app_type = Applicants_Type;


            //New code Start --------------------------------
            try {
                var param_map = { "account_id": Account_Name_id };

                var param_map_str = JSON.stringify(param_map);

                rest_param = { "triggered_from": "TVR.OnLoad.TVR_onload.GET.Account", "param_map": encodeURI(param_map_str) }
                headers = {};

                var response1 = ZDK.Apps.CRM.Functions.execute("Client_Script_Assistance_TVR", rest_param);

                var current_data = response1._details.output;
                console.log(current_data)
                var convert_data = JSON.parse(current_data);
                console.log(convert_data)
                if (convert_data.error_message == "mismatch id") {
                    console.log("system failed");

                }
                else if (response1._code == "INVALID_DATA") {
                    console.log("system failed")
                }
                else if (convert_data.status == "success") {
                    var Loan_Product_Type = convert_data.Loan_Product_Type;
                    var Requested_Loan_Amount = convert_data.Requested_Loan_Amount;
                    var Source_Branch = convert_data.Source_Branch;
                    var Requested_Tenure_Months = convert_data.Requested_Tenure_Months;
                    var Customer_Type = convert_data.Customer_Type;
                    var Phone = convert_data.Phone;
                    var Requested_Loan_Amount = convert_data.Requested_Loan_Amount;
                    var Type_of_Employement = convert_data.Type_of_Employement;
                }
                else if (convert_data.status == "failed") {
                    cosole.log("function failed")
                }
            }
            catch (e) {
                var param_map = { "details": details, "error_message": e, "action_performed": "> Values getting." };
                var response = ZDK.Apps.CRM.Functions.execute("client_script_assistance_error_message", { "triggered_from": "Error_Message", "param_map": encodeURI(JSON.stringify(param_map)) });
            }
            //New code End --------------------------------

            var loan_type = Loan_Product_Type;
            console.log(response1);


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

            // CTLZ-35441
            // M Izzath Suhail
            //17/04/2025 start
            var app_no = ZDK.Page.getField('Name').getValue();
            // var ah_section = ZDK.UI.getElementByID('Annual_H_sec1');
            // var ah_section_2 = ZDK.UI.getElementByID('Annual_H_sec2');
            // var ah_section_3 = ZDK.UI.getElementByID('Annual_H_sec3');
            console.log("flag_s");
            var flag_s = ZDK.Page.getField("Annual_Household_Flag");
            console.log(flag_s);
            var flasjh = flag_s.getValue();
            console.log(flasjh);
            if (app_type == "Applicant") {
                console.log(Loan_Product_Type);
                console.log(Type_of_Employement);
                console.log("Type_of_Employment_start");
                flag_s.setValue(true);
                var st_flag = flag_s.getValue();
                console.log(st_flag);
                console.log("Type_of_Employment_end")
                ZDK.Page.getField("Total_Annual_household_income").setVisibility(false);
                if (Loan_Product_Type === "Business Loan" && Type_of_Employement === "Non Sole Proprietor") {
                    ZDK.Page.getField("Total_Annual_household_income").setVisibility(false);
                    ZDK.Page.getField("Spouse_Annual_Income").setVisibility(false);
                    ZDK.Page.getField("Unmarried_children_s_Annual_Income").setVisibility(false);
                    ZDK.Page.getField("Applicant_Annual_Income").setVisibility(false);
                    // flag_s.setValue(false);
                    console.log("sdssd")
                    ZDK.Page.getField("Annual_Household_Flag").setValue(false);
                    var st_flag = flag_s.getValue();
                    console.log(st_flag);

                    // ah_section.setVisibility(false);
                    // ah_section_2.setVisibility(false);
                    // ah_section_3.setVisibility(false);
                    // Annual_H_sec1
                    // Monthly_Salary
                    // var app_lookup = ZDK.Page.getField('Annual_Household_Flag').getValue();
                    // console.log(app_lookup)
                    // ZDK.Page.getField('Annual_Household_Flag').setValue(false);
                    // var updatedValue = ZDK.Page.getField('Annual_Household_Flag').getValue();
                    //  console.log("Checkbox value after setting:", updatedValue);
                }

                if (Loan_Product_Type === "Personal Loan" && Type_of_Employement != "Self Employed Non Professional") {
                    var query = "select Loan_Application_Record_ID,id,Monthly_Salary from Employment_Details where (Name='" + app_no + "')";
                    console.log(query);
                    var parameters = { "select_query": query };
                    var headers = { "content-type": "application/json" };
                    var response = ZDK.Apps.CRM.Connections.invoke("zohocrmall", "https://www.zohoapis.in/crm/v8/coql", "POST", 2, parameters, headers);
                    console.log(response);
                    console.log("coql response:");
                    var monthly_salary = response._details.statusMessage.data[0].Monthly_Salary;
                    console.log("monthly_salary");
                    console.log(monthly_salary);
                    annual_monthlysal = monthly_salary * 12;
                    ZDK.Page.getField("Applicant_Annual_Income").setValue(annual_monthlysal);
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
                // ah_section.setVisibility(false);
                // ah_section_2.setVisibility(false);
                // ah_section_3.setVisibility(false);
            }
            // CTLZ-35441
            // M Izzath Suhail
            //17/04/2025 end

            //console.log(appusers);

            var user = $Crm.user;
            var user_email = user.email;

            //New code Start --------------------------------
            try {
                var param_map = { "user_email": user_email };

                var param_map_str = JSON.stringify(param_map);

                rest_param = { "triggered_from": "TVR.OnLoad.TVR_onload.GET.Search", "param_map": encodeURI(param_map_str) }
                headers = {};

                var response1 = ZDK.Apps.CRM.Functions.execute("Client_Script_Assistance_TVR", rest_param);

                var current_data = response1._details.output;
                console.log(current_data)
                var convert_data = JSON.parse(current_data);
                console.log(convert_data);

                if (convert_data.error_message == "mismatch id") {
                    console.log("system failed");

                }
                else if (response1._code == "INVALID_DATA") {
                    console.log("system failed")
                }
                else if (convert_data.status == "success") {
                    var Name = convert_data.Name;
                    var Employee_ID = convert_data.Employee_ID;
                    console.log(convert_data.Employee_Role);
                    var Roles = convert_data.Employee_Role.toString();
                }
                else if (convert_data.status == "failed") {
                    cosole.log("function failed")
                }
            }
            catch (e) {
                var param_map = { "details": details, "error_message": e, "action_performed": "> Values getting." };
                var response = ZDK.Apps.CRM.Functions.execute("client_script_assistance_error_message", { "triggered_from": "Error_Message", "param_map": encodeURI(JSON.stringify(param_map)) });
            }
            //New code End --------------------------------

            console.log(Roles);
            ZDK.Page.getField('Employee_Name').setValue(Name);
            ZDK.Page.getField('Employee_Name').setReadOnly(true);


            ZDK.Page.getField('Employee_ID').setValue(Employee_ID);
            ZDK.Page.getField('Employee_ID').setReadOnly(true);

            ZDK.Page.getField('Employee_Role').setValue(Roles);
            ZDK.Page.getField('Employee_Role').setReadOnly(true);


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
            try {
                var loan_type = ZDK.Page.getField("Loan_Type").getValue();
                console.log(loan_type);
                idd = ZDK.Page.getField("Applicant").getValue().id;
                console.log(idd);
                var rec2 = ZDK.Apps.CRM.Contacts.fetchById(idd);
                console.log(rec2);
                if ((rec2._Applicants_Type == "Applicant") && (rec2._Applicant_Employment_Type == "Salaried") && loan_type == "Personal Loan") {
                    ZDK.Page.getField("Declaration_Visibility").setValue(true);

                } else {
                    ZDK.Page.getField("Declaration_Visibility").setValue(false);
                }
            } catch (e) {
                console.log(e);
                console.log("Error in setting Declaration_Visibility");

            }

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
            
            // Mandatory 
            var tvr_mandatory_fields = [
                "Name_of_Person_Contacted",
                "Number_of_Years_in_the_Company"
            ];
            
            tvr_fields.forEach(function (api_name) {
                try 
                {
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
                } catch (e) {
                        console.log("Error on field " + api_name + ": " + e);
                }
            });

            } catch (e) {
                var param_map = { "details": details, "error_message": e, "action_performed": "> PL Salaried TVR fields hide/show." };
            }
            // ===== END TVR PL Salaried =====
 

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
                            var param_map = { "details": details, "error_message": e, "action_performed": "> Values getting." };
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
                    console.log("sss")
                    if (Co_Applicant_Employment_Type == "Housewife" || Co_Applicant_Employment_Type == "Retired" || Co_Applicant_Employment_Type == "Unemployed") {
                        console.log("sss1")
                        ZDK.Page.getField('Button').setValue('Button4');
                        ZDK.Page.getField('Non_Fin_Flow_Type').setValue(Co_Applicant_Employment_Type);
                        if (Co_Applicant_Employment_Type == "Retired") {
                            ZDK.Page.getField("SENP_Button").setValue("Button1");
                        }
                        else {
                            ZDK.Page.getField("SENP_Button").setValue("Button2");
                        }
                    }
                    else {
                        console.log("sss3")
                        ZDK.Page.getField('Button').setValue('Button3');
                    }
                    try {
                        if (ZDK.Page.getField("Constitution_Type")) {
                            ZDK.Page.getField("Constitution_Type").setVisibility(true);
                        }
                        if (ZDK.Page.getField("For_Non_Sole_detail_of_all_share_holders")) {
                            ZDK.Page.getField("For_Non_Sole_detail_of_all_share_holders").setVisibility(true);
                        }
                    }
                    catch (e) {
                        var param_map = { "details": details, "error_message": e, "action_performed": "> Values getting." };
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
                    if (Guarantor_Employment_Type == "Housewife" || Guarantor_Employment_Type == "Retired" || Guarantor_Employment_Type == "Unemployed") {
                        ZDK.Page.getField('Button').setValue('Button4');
                        ZDK.Page.getField('Non_Fin_Flow_Type').setValue(Co_Applicant_Employment_Type);
                        if (Co_Applicant_Employment_Type == "Retired") {
                            ZDK.Page.getField("SENP_Button").setValue("Button1");
                        }
                        else {
                            ZDK.Page.getField("SENP_Button").setValue("Button2");
                        }
                    }
                    else {
                        ZDK.Page.getField('Button').setValue('Button3');
                    }
                    try {
                        if (ZDK.Page.getField("Constitution_Type")) {
                            ZDK.Page.getField("Constitution_Type").setVisibility(true);
                        }
                        if (ZDK.Page.getField("For_Non_Sole_detail_of_all_share_holders")) {
                            ZDK.Page.getField("For_Non_Sole_detail_of_all_share_holders").setVisibility(true);
                        }
                    } catch (e) {
                        var param_map = { "details": details, "error_message": e, "action_performed": "> Condition based field hide and show." };
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
} catch (e) {
    var param_map = { "details": details, "error_message": e, "action_performed": "> Overall catch." };
    var response = ZDK.Apps.CRM.Functions.execute("client_script_assistance_error_message", { "triggered_from": "Error_Message", "param_map": encodeURI(JSON.stringify(param_map)) });
}
ZDK.Client.hideLoader();
