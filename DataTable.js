import React, { useState, useEffect } from 'react'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import { ListItem, ThemeProvider, createTheme } from '@mui/material';
import Timer from './Timer';
import './DataTable.css'
import DataRow from './DataRow';
import SendLinkButton from './SendLinkButton';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import Tooltip from '@mui/material/Tooltip';
import RefreshIcon from '@mui/icons-material/Refresh';
import Button from '@mui/material/Button';

import FaceIcon from '@mui/icons-material/Face';



export default function DataTable(props) {

    const theme = createTheme({
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        backgroundColor: 'rgb(242 248 255)', // Your custom background color
                        color: 'rgb(0 117 255)', // Your custom text color,
                        border: '1px solid rgb(76 158 255)'
                        // Add any other styles you want to override here
                    },
                },
            },
        },
    });

    const [applicants, setApplicants] = useState([]);
    const curr_record_id = Array.isArray(props.data.EntityId) ? props.data.EntityId[0] : props.data.EntityId;
    // props.data.data.Loan_Application.id; // widget in wizard
    // const curr_record_id = props.data.EntityId[0]; //button widget
    // const curr_record_id = "564272000073684533";
    const [showProgress, setshowProgress] = useState(false);
    const [secs, setsecs] = useState(0);
    const [mins, setmins] = useState(0);
    const [reload, setReload] = useState(0);
    const [disable_widget, setdisable_widget] = useState(true);

    // BRD "Verification Method Selection": only one method at a time per applicant row.
    // While the OTP timer runs, "Send email link" is disabled; while the link timer runs,
    // "Send OTP" is disabled and "Enter OTP" is hidden. Each row (Applicant / Co-applicant /
    // Guarantor) is tracked separately by its subform row id, so rows never block each other.
    const [otpActive, setOtpActive] = useState({});   // { [row id]: true/false }
    const [linkActive, setLinkActive] = useState({}); // { [row id]: true/false }

    function markOtpActive(row_id, active) {
        setOtpActive(prev => ({ ...prev, [row_id]: active }));
    }

    function markLinkActive(row_id, active) {
        setLinkActive(prev => ({ ...prev, [row_id]: active }));
    }


    function handleChildChange(subform_id, OTP_validation_status, valid_OTP) {
        // console.log("handleChildChange", email, OTP_validation_status, applicants);


        let copy_arr = [...applicants];
        console.log("handleChildChange", subform_id, OTP_validation_status, copy_arr);

        let index = copy_arr.findIndex((item) => item.id === subform_id);
        console.log("index", index);

        // subform_id = progress/non-progress
        // if (index!==-1 && subform_id === "progress") {
        //     copy_arr[index].OTP_validation_status = "progress";
        //     setApplicants(copy_arr);

        // }
        // else
        if (index !== -1) {
            copy_arr[index].OTP_validation_status = "Yes";
            copy_arr[index].valid_OTP = valid_OTP;
            copy_arr[index].Verification_Method = "OTP"; // BRD: store the verification method
            setApplicants(copy_arr);
            // var config = {
            //     Entity: "Accounts",
            //     APIData: {
            //         "id": curr_record_id,
            //         "Subform_8": applicants

            //     },
            // }
            // window.ZOHO.CRM.API.updateRecord(config)
            //     .then(function (data) {
            //         console.log("update response:", data);
            //     })



            var conn_name = "zohocrmall";
            var req_data = {
                "parameters": {
                    "data": [{
                        "Subform_8": applicants,
                        "Email_Last_Verified_at": new Date().toJSON()
                    }],

                },
                "method": "PUT",
                "url": "https://www.zohoapis.in/crm/v2/Accounts/" + curr_record_id + "",
            };

            window.ZOHO.CRM.CONNECTION.invoke(conn_name, req_data)
                .then(function (datanew) {
                    console.log("update subform:", datanew)
                })


        }
    }

    useEffect(() => {

        //         Email verification(Sub form):
        // Applicant type - Applicant, Co-Applicant, Guarantor
        // Constitution type - Sole, Non-sole
        // First name
        // Middle name
        // Last name
        // Email
        // Entity name
        // Key person name
        // valid OTP
        // OTP validation  status - Yes, No(default).
        /*
        if(Constitution type==="Sole" || Constitution type==="Individual"){
        
            if(Constitution type==="Sole"){
                display Entity_name
            }
            First name
            Middle name
            Last name
            EmailID 
        }
        else{
        Entity name
        key person name
        key person Email ID
        }
        
        */
        console.log("data table useeffect:", props);
        setshowProgress(true);

        const getSetData = async () => {
            window.ZOHO.CRM.API.getRecord({
                Entity: "Accounts", approved: "both", RecordID: curr_record_id
            })
                .then(async function (data) {


                    if (data.hasOwnProperty("data")) {
                        console.log("records:", data.data[0]);
                        let applicant_record = data.data[0];
                        // data.data[0].Subform_8[0].OTP_validation_status = "Yes";


                        // timer
                        var func_name = "send_otp_to_email";
                        var req_data = {
                            "arguments": JSON.stringify({
                                // "app_id": props.row.Applicant.id, //subform record id
                                // "email": props.row.Email, // 
                                // "loanid": props.curr_record_id
                                "add_params": { "action": "getTimer", "loan_id": curr_record_id }
                            })
                        };



                        window.ZOHO.CRM.FUNCTIONS.execute(func_name, req_data)
                            .then(async function (data) {
                                console.log("on load custom function", data);
                                if (data.code === "success") {
                                    let output = JSON.parse(data.details.output);
                                    if (output.status === true) {
                                        setmins(output.otp_min);
                                        setsecs(output.otp_secs);
                                        let widget_applicants = output.widget_applicants;
                                        for (let index = 0; index < widget_applicants.length; index++) {
                                            for (let index2 = 0; index2 < applicant_record.Subform_8.length; index2++) {
                                                if (widget_applicants[index].Applicant.id === applicant_record.Subform_8[index2].Applicant.id) {
                                                    applicant_record.Subform_8[index2] = { ...applicant_record.Subform_8[index2], ...widget_applicants[index]};
                                                    break;
                                                }

                                            }
                                        }


                                        setApplicants(applicant_record.Subform_8);
                                        setshowProgress(false);
                                    }
                                    // setShowOTPSentSnack(true);
                                    // setSeconds(30); setMinutes(1);


                                }
                            })
                        // permissions
                        window.ZOHO.CRM.CONFIG.getCurrentUser().then(async function (cur_usr) {
                            console.log("cur_usr", cur_usr);

                            if (((data.data[0].Application_Stage === "Credit Journey" || data.data[0].Application_Stage === "In Principle Sanction")&& data.data[0].Owner.id === cur_usr.users[0].id) || (cur_usr.users[0].profile.name === "Administrator")) {
                                // 419602000000252001
                                setdisable_widget(false);
                            }
                        });
                        // permissions
                    }

                    // timer

                   
                });
            //push
            // setApplicants([{
            //     "type_of_app": "Applicant",
            //     "first_name": "Divili - ap",
            //     "middle_name": "Sai - ap",
            //     "last_name": "Kishore - ap",
            //     "email": "saikishore.d@zohocorp.com - ap"

            // }, {
            //     "type_of_app": "Co-Applicant",
            //     "first_name": "Divili - co",
            //     "middle_name": "Sai - co",
            //     "last_name": "Kishore - co",
            //     "email": "saikishore.d@zohocorp.com - co"

            // }, {
            //     "type_of_app": "Gaurantor",
            //     "first_name": "Divili - gntr",
            //     "middle_name": "Sai - gntr",
            //     "last_name": "Kishore - gntr",
            //     "email": "saikishore.d@zohocorp.com - gntr"

            // }]);
            console.log("applicants:", applicants);
        }
        getSetData();
    }, [reload]);


    return (
        <ThemeProvider theme={theme}>

            <Box sx={{ m: '1em', border: '0.124em groove rgb(190, 187, 187)', borderRadius: '8px', pb: '2%' }}>

                <Box sx={{ marginTop: '2%', marginLeft: '1%', marginRight: '1.5%', marginBottom: '0.7%' }}>
                    <div style={{ textAlign: "end" }}>
                        <Tooltip title="Click to reload">
                            <Button size='small' variant='outlined' onClick={e => setReload(reload + 1)} sx={{ textTransform: 'capitalize', backgroundColor: '#edf6ff', fontFamily: 'Zoho_Puvi_Regular', fontSize: '0.9rem' }}>
                                <RefreshIcon fontSize='small' color='white' /> &nbsp; Reload
                            </Button>
                        </Tooltip>
                    </div>
                </Box>
                {

                    !showProgress ?
                        <Box sx={{ marginLeft: '1%', marginRight: '1%' }}>
                            <TableContainer>
                                <Table aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align='center' >Type of Applicant</TableCell>
                                            <TableCell align='center' >Details of Applicant</TableCell>
                                            <TableCell align="center" >OTP / Email Link</TableCell>
                                            {/* <TableCell align="center" sx={{ border: "0.125em solid #bbbbbb" }}>OTP verified_status</TableCell> */}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>

                                        {applicants.map((row, index) => (
                                            <TableRow
                                                key={row.name}
                                            // sx={{ border: "0.124em groove black" , height:'2px'}}
                                            >
                                                {/* <Box
                                    sx={{
                                        display: 'flex',
                                        // flexWrap: 'wrap',
                                        '& > :not(style)': {
                                            m: 1,
                                            width:'100%'
                                            // width: 128,
                                            // height: 128,
                                        },
                                    }}
                                > */}
                                                {/* <Paper elevation={3} > */}
                                                <TableCell sx={{ textAlign: 'center' }}>{row.Applicant_type}</TableCell>

                                                <TableCell sx={{}}>

                                                    {
                                                        row.Constitution_type === null || row.Constitution_type === "Sole" ?
                                                            (

                                                                row.Constitution_type === "Sole" ?
                                                                    (
                                                                        <>
                                                                            {/* Sole properioter */}
                                                                            <DataRow data={{ "value": row.Entity_name, key: "Entity_name" }} />
                                                                            <DataRow data={{ "value": row.First_name, key: row.Applicant_type + " First_name" }} />
                                                                            <DataRow data={{ "value": row.Middle_name, key: row.Applicant_type + " Middle_name" }} />
                                                                            <DataRow data={{ "value": row.Last_name, key: row.Applicant_type + " Last_name" }} />
                                                                            <DataRow data={{ "value": row.Email, key: row.Applicant_type + " Email" }} />
                                                                        </>
                                                                    )
                                                                    :
                                                                    (
                                                                        <>
                                                                            {/* Indivial */}
                                                                            <DataRow data={{ "value": row.First_name, key: row.Applicant_type + " First_name" }} />
                                                                            <DataRow data={{ "value": row.Middle_name, key: row.Applicant_type + " Middle_name" }} />
                                                                            <DataRow data={{ "value": row.Last_name, key: row.Applicant_type + " Last_name" }} />
                                                                            <DataRow data={{ "value": row.Email, key: row.Applicant_type + " Email" }} />
                                                                        </>
                                                                    )
                                                            )
                                                            :
                                                            (
                                                                // Non-sole prop
                                                                <>
                                                                    <DataRow data={{ "value": row.Key_person_name, key: row.Applicant_type + " Key_person_name" }} />
                                                                    <DataRow data={{ "value": row.Entity_name, key: row.Applicant_type + " Entity_name" }} />
                                                                    <DataRow data={{ "value": row.Email, key: row.Applicant_type + " Key Person Email" }} />
                                                                </>
                                                            )

                                                    }

                                                </TableCell>

                                                <TableCell sx={{ alignContent: '' }}>
                                                    <Timer row={row} curr_record_id={curr_record_id} onChildChange={handleChildChange} otp_mins={mins} otp_secs={secs} disable_widget={disable_widget}
                                                        link_active={!!linkActive[row.id]}
                                                        onOtpActive={markOtpActive}>
                                                        {/* OR verify via email link - shown straight below "Send OTP" (link timer = same minutes as the OTP timer) */}
                                                        <SendLinkButton row={row} curr_record_id={curr_record_id} disable_widget={disable_widget} onVerified={() => setReload(r => r + 1)}
                                                            link_mins={mins} link_secs={secs}
                                                            otp_active={!!otpActive[row.id]}
                                                            onLinkActive={markLinkActive} />
                                                    </Timer>
                                                    {/* send/Resend Button */}

                                                    {/*                                       
                                    <Grid container
                                        direction="row"
                                        justifyContent="center"
                                        alignItems="center"
                                        display={'flex'}
                                        spacing={3}

                                        sx={{ width: '100%', borderColor: 'error.main', margin: 1 }}>

                                        <Grid item xs={6}>
                                            <Button disabled={seconds +minutes> 0} variant="contained" onClick={e => {
                                                setSeconds(3); setMinutes(1);
                                                setsendOTPBtnText("Resend OTP");
                                            }}>
                                                {sendOTPBtnText}
                                            </Button>

                                        </Grid>

                                    </Grid> */}


                                                </TableCell>
                                                {/* <TableCell sx={{ border: "0.125em solid #bbbbbb" }}>


                                    <Grid item textAlign={'center'} >

                                        {row.OTP_validation_status !== "progress" ?
                                            (row.OTP_validation_status === "Yes" ?
                                                <Chip
                                                    icon={<FaceIcon />}
                                                    color='success'
                                                    label="User verifed"
                                                />
                                                :
                                                <Chip
                                                    icon={<FaceIcon />}
                                                    color='error'
                                                    label="User not yet verified"
                                                />
                                            ) :
                                            <CircularProgress />
                                        }
                                    </Grid>
                                </TableCell> */}
                                            </TableRow>
                                        ))}

                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                        :
                        // <Backdrop
                        //     sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                        //     open={showProgress}
                        //     // onClick={handleClose}
                        // >
                        <CircularProgress color="primary" />
                    // </Backdrop>
                }
            </Box>
        </ThemeProvider >
    )
}