import React from 'react'
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';
import Chip from '@mui/material/Chip';
import FaceIcon from '@mui/icons-material/Face';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';


export default function Timer(props) {

    const [otp, setOtp] = useState(null);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [sendOTPBtnText, setsendOTPBtnText] = useState("Send OTP");
    const [showProgress, setshowProgress] = useState(false);
    const [showOTPSentSnack, setShowOTPSentSnack] = React.useState(false);
    const [func_execution, setfunc_execution] = useState(false);


    // console.log("Timer props:", props);


    function handleEmailVerificationTextChange(otp) {
        console.log("email:", props.row.email, "otp:", otp);

        if (otp.toString().length == 6) {
            // Email Verification
            setshowProgress(true);

            var func_name = "Email_otp_verification";
            var req_data = {
                "arguments": JSON.stringify({
                    "otp": otp,
                    "loanid": props.curr_record_id,
                    "email": props.row.email,//"saikishore.d@zohocorp.com",
                    "user_id": "aaa",
                    "app_id": props.row.Applicant.id
                })
            };

            window.ZOHO.CRM.FUNCTIONS.execute(func_name, req_data)
                .then(function (data) {
                    // response = Success/ Failed
                    console.log("verification response", data);
                    if (data.details.output === "Success") {
                        setMinutes(0);
                        setSeconds(0);
                        setsendOTPBtnText("Send OTP");
                        props.onChildChange(props.row.id, "Yes", otp);
                    }
                    setshowProgress(false);
                    props.onChildChange("non-progress", null);
                })
        }


        /*
        temp change
                    setOTP_validation_status("Yes");
                    setMinutes(0);
                    setSeconds(0);
                    props.onChildChange(props.email, "Yes");
        */
    }


    function handleSendOtp() {
        setfunc_execution(true);
        setOtp('');
        console.log("clear otp:", otp, props.curr_loan_app_id, props.row.Email, props);



        // send_otp_to_email custom function
        var func_name = "send_otp_to_email";
        var req_data = {
            "arguments": JSON.stringify({
                "app_id": props.row.Applicant.id, //subform record id
                "email": props.row.Email, // 
                "loanid": props.curr_record_id
            })
        };



        window.ZOHO.CRM.FUNCTIONS.execute(func_name, req_data)
            .then(function (data) {
                console.log("custom function", data);
                if (data.code === "success") {
                    let output = JSON.parse(data.details.output);

                    if (output.status === true) {
                        setfunc_execution(false);
                        setShowOTPSentSnack(true);
                        setSeconds(props.otp_secs);
                        setMinutes(props.otp_mins);

                        setsendOTPBtnText("Resend OTP");
                    }

                }

            }).catch(e => {
                console.log("catch in otp send:", e);
                setfunc_execution(false);
            })
    }


    useEffect(() => {
        // props.OTP_validation_status='Yes';
        if (seconds !== 0 || minutes !== 0) {
            const interval = setInterval(() => {
                if (seconds > 0) {
                    setSeconds(seconds - 1);
                }

                if (seconds === 0) {
                    if (minutes === 0) {

                        clearInterval(interval);

                    } else {
                        setSeconds(59);
                        setMinutes(minutes - 1);
                    }
                }
            }, 1000);

            return () => {
                clearInterval(interval);
            };
        }
        else {
            setOtp('');
            console.log("otp:", otp);
        }
    }, [minutes, seconds]);

    // BRD: while the OTP timer runs, "Send email link" is disabled - tell the parent
    const otpActive = (seconds + minutes) > 0;
    useEffect(() => {
        if (props.onOtpActive) props.onOtpActive(props.row.id, otpActive);
    }, [otpActive]);

    return (
        <Grid container
            direction="row"
            justifyContent="center"
            alignItems='center'
            spacing={1}>

            {/* <Snackbar
        open={showOTPSentSnack}
        autoHideDuration={6000}
        onClose={e=>setShowOTPSentSnack(false)}
        message="OTP sent"
      /> */}

            {/* Send/ Resend OTP button - "Send email link" (passed as children) sits straight below it */}
            <Grid item sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {
                    (func_execution == false) ?
                        <Button size="small" style={{
                            backgroundColor: ((props.disable_widget || seconds + minutes > 0 || props.row.OTP_validation_status !== "No" || props.link_active)) ? "darkgrey" : "#013f88",
                            color: (props.disable_widget || seconds + minutes > 0 || props.row.OTP_validation_status !== "No" || props.link_active) ? "white" : "white",
                            border: 'unset',
                            width: 150 // same width as "Send email link"
                        }} disabled={props.disable_widget || (seconds + minutes) > 0 || props.row.OTP_validation_status !== "No" || props.link_active}
                            variant="outlined" onClick={e => {
                                handleSendOtp();
                            }}>
                            {sendOTPBtnText}
                        </Button>
                        :
                        <>
                            <CircularProgress />
                        </>
                }
                {props.children}
            </Grid>

            {/* OTP textfeild - BRD: not shown while the email link is in progress */}
            {!props.link_active &&
            <Grid item >
                <TextField type='text' disabled={seconds + minutes === 0} id="outlined-basic" label="Enter OTP" variant="standard" value={otp}

                    onChange={e => {

                        let inputValue = e.target.value;
                        if (/^[0-9]*$/.test(inputValue) && inputValue.length <= 6) {
                            setOtp(e.target.value);
                            handleEmailVerificationTextChange(e.target.value);
                        }


                    }}
                // helperText="Some important text"


                />
                {/* <TextField type='text' inputProps={{ inputMode:'numeric'}} /> */}
                {seconds + minutes > 0 ? (
                    <div style={{ textAlign: 'center', color: '#1976d2' }}>
                        Time Remaining: {minutes < 10 ? `0${minutes}` : minutes}:
                        {seconds < 10 ? `0${seconds}` : seconds}
                    </div>
                ) : (
                    <div></div>
                )}

            </Grid>
            }

            <Grid item >
                {showProgress ?
                    <CircularProgress />
                    :
                    <>
                        {/* <Chip
                            // icon={<FaceIcon />}
                            color={props.row.OTP_validation_status === "Yes" ? 'success' : "error"}
                            label={props.row.OTP_validation_status === "Yes" ? "User verifed" : "User not yet verified"}
                        /> */}


                        <Chip size="small" sx={{
                            backgroundColor: props.row.OTP_validation_status === "Yes" ? '#c4f0b3' : "#ffc6c6",
                            border: props.row.OTP_validation_status === "Yes" ? '1px solid #76c358' : '1px solid #ff8888'
                            // backgroundColor: props.row.OTP_validation_status !== "Yes" ? '#c4f0b3' : "#ffc6c6",
                            // border: props.row.OTP_validation_status !== "Yes" ? '1px solid #8abb77' : '1px solid #ff8888'
                        }}
                            label={props.row.OTP_validation_status === "Yes" ? "Verifed" : "Not Verified"}
                        // deleteIcon={props.row.OTP_validation_status === "Yes" ? <DoneIcon /> : <CloseIcon />} 
                        // onDelete={e => console.log("")}
                        // variant="outlined"
                        />
                    </>

                }
            </Grid>


        </Grid>
    )
}