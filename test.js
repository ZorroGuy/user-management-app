string standalone.send_email_verification_link(String email,String loanid,String app_id)
{
response_map = Map();
response_map.put("status",false);
response_map.put("message","Email Link API Failed");
// =====================================================================
// Zoho CRM > Setup > Developer Hub > Functions > New Function
//   Name      : send_email_verification_link
//   Category  : Standalone
//   Arguments : email (string), loanid (string), app_id (string)
// Called from the widget (SendLinkButton.js) - same way as send_otp_to_email.
// Same pattern as send_otp_to_email: Bridge sends the email, Logger keeps msgId.
//
try 
{
	if(isNull(email) || email.trim() == "")
	{
		response_map.put("message","Email is empty for this applicant");
		return response_map;
	}
	loan_rec = zoho.crm.getRecordById("Accounts",loanid);
	subform_rows = ifnull(loan_rec.get("Subform_8"),List());
	// Find this applicant's row (for the name in the email)
	customer_name = "";
	found = false;
	for each  row in subform_rows
	{
		if(row.get("Applicant") != null && row.get("Applicant").get("id").toString() == app_id.toString())
		{
			found = true;
			if(ifnull(row.get("OTP_validation_status"),"").equalsIgnoreCase("Yes"))
			{
				response_map.put("message","Email is already verified");
				return response_map;
			}
			customer_name = (ifnull(row.get("First_name"),"") + " " + ifnull(row.get("Last_name"),"")).trim();
			if(customer_name == "")
			{
				customer_name = ifnull(row.get("Key_person_name"),ifnull(row.get("Entity_name"),""));
			}
		}
	}
	if(!found)
	{
		response_map.put("message","Applicant row not found in Subform_8");
		return response_map;
	}

	/// api 
	get_api_domain_wso2 = zoho.crm.getOrgVariable("Local_Onprem_WSO2");
	lstg_token = standalone.get_api_token(get_api_domain_wso2);

    header_data = Map();
	header_data.put("Authorization","Bearer " + lstg_token);
	header_data.put("x-email-key","UAT-2t0dYfhTq34EjHA2wlHq");
	header_data.put("Content-Type","application/json");

	emailList = List();
	emailList.add(email);

	body = Map();
	body.put("ProductName","Traditional");
	body.put("toMailId",emailList);
	body.put("subject","Personal Email ID Verification");
	body.put("keyId",loan_rec.get("Loan_Application_No"));
	body.put("CustomerName",customer_name);
	body.put("userType","Email");
	body.put("templateId","B-MA-TRADITIONAL-20250521-8079");
	body.put("fromCode","NOREPLY");

	info "EMAIL API HEADERS : " + header_data;
	info "EMAIL API BODY : " + body;
	loggermap = Map();
	request_time = zoho.currenttime;
	loggermap.put("Request_Time",request_time);
	response = invokeurl
	[
		url :"https://" + get_api_domain_wso2 + ".chola.murugappa.com/bridgeemail/1.0.0/connection/api/email/send/otp"
		type :POST
		parameters:body.toString()
		headers:header_data
		content-type:"application/json"
	];

	info "EMAIL API RESPONSE : " + response;


	response_time = zoho.currenttime;
	loggermap.put("Response_Time",response_time);
	loggermap.put("API","Email Verification Request Link");
	loggermap.put("Name","Email Verification Request Link API");
	loggermap.put("Loan_Application",{"id":loanid});
	loggermap.put("Loan_Application_ID",loanid);
	loggermap.put("Applicant",{"id":app_id});
	loggermap.put("Applicant_ID",app_id);
	loggermap.put("Application_Number",loan_rec.get("Loan_Application_No"));
	loggermap.put("Deluge_Function_Name","send_email_verification_link : standalone");
	loggermap.put("Response",response);
	loggermap.put("Email",email);
	// Email API response (direct call, not the Bridge wrapper):
	// {"traceId":"...","responseDate":"...","status":true,"message":"Success",
	//  "data":{"msg":"Email initiated successfully","message":"SucessFull","list":{"request_id":"...","msgId":"..."}}}
	res = response.toString().toMap();
	res_data = ifnull(res.get("data"),Map());
	res_list = ifnull(res_data.get("list"),Map());
	msg_id = res_list.get("msgId");
	loggermap.put("Time_Taken",((response_time.toLong() - request_time.toLong()) / 1000).toString() + " secs");
	if(res.get("status") == true && !isNull(msg_id) && msg_id.toString() != "")
	{
		loggermap.put("API_Call_Status","Success");
		// msgId is the key the callback uses to find this applicant (same as OTP verify)
		loggermap.put("Email_OTP_Request_ID",res_list.get("request_id"));
		loggermap.put("Email_OTP_Message_ID",msg_id);
		loggermap.put("Email_verification_status","Link Sent");
		// Mark the row as "Sent". Send ALL rows with id, otherwise CRM deletes the missing rows.
		new_rows = List();
		for each  row in subform_rows
		{
			r = Map();
			r.put("id",row.get("id"));
			if(row.get("Applicant") != null && row.get("Applicant").get("id").toString() == app_id.toString())
			{
				// Link timer starts from this time (widget locks "Send OTP" until Link_Sent_At + timer minutes)
				r.put("Link_Sent_At",zoho.currenttime);
			}
			new_rows.add(r);
		}
		info zoho.crm.updateRecord("Accounts",loanid,{"Subform_8":new_rows});
		response_map.put("message","Verification link sent successfully!");
		response_map.put("status",true);
	}
	else
	{
		loggermap.put("API_Call_Status","Failed");
		response_map.put("message","Email Link API Failed: " + ifnull(res.get("message"),"No response"));
	}
	info "createRecord:" + zoho.crm.createRecord("Logger",loggermap);
}
catch (e)
{
	dmp = Map();
	dmp.put("From","Deluge Function");
	dmp.put("Function Name","send_email_verification_link");
	dmp.put("Name","send_email_verification_link");
	emp = Map();
	emp.put("details",dmp);
	emp.put("error_message",e.toString());
	emp.put("action_performed","send_email_verification_link > bridge call > record updating.");
	info emp;
	info standalone.Client_Script_Assistance_Error_message(emp,"Error_Message");
}
return response_map;
}