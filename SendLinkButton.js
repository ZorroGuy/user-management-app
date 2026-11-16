import React, { useEffect, useState } from 'react'
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';

// While the link timer runs, check CRM this often to see if the customer clicked the link.
const POLL_INTERVAL_MS = 10000;

/*
 * "Send email link" verification - alternative to OTP.
 *
 * Flow:
 *  1. Click "Send email link" -> CRM function `send_email_verification_link`
 *     (BFSI Bridge sends the link email, Logger saves msgId, row Link_Sent_At = now).
 *  2. Customer clicks the link -> Bridge calls CRM REST-API function `Email_Verification_Callback`
 *     (finds the applicant via Logger msgId, sets OTP_validation_status = "Yes", Verification_Method = "LINK").
 *  3. Link timer = same minutes as the OTP timer, counted from Link_Sent_At (saved in CRM, so it
 *     survives a reload). While it runs: "Send OTP" is disabled, "Enter OTP" is hidden, and this
 *     widget checks the record; when the row becomes verified it asks the parent to reload.
 *  4. When the timer ends the user can "Resend email link" or switch to OTP.
 */

function toTime(value) {
    if (!value) return null;
    const t = new Date(value).getTime();
    return isNaN(t) ? null : t;
}

export default function SendLinkButton(props) {
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState("");
    // Time the link was sent: from CRM (Link_Sent_At) or set locally right after a successful send
    const [sentAt, setSentAt] = useState(toTime(props.row.Link_Sent_At));
    const [now, setNow] = useState(Date.now());

    // Row reloaded from CRM (e.g. Reload button, or email changed -> Link_Sent_At cleared)
    useEffect(() => {
        setSentAt(toTime(props.row.Link_Sent_At));
    }, [props.row.Link_Sent_At, props.row.Email]);

    const timerMs = ((props.link_mins || 0) * 60 + (props.link_secs || 0)) * 1000;
    const remainingMs = sentAt ? Math.max(0, sentAt + timerMs - now) : 0;
    const linkActive = remainingMs > 0;

    const isVerified = props.row.OTP_validation_status === "Yes";
    // BRD: while OTP is in progress, "Send email link" is disabled
    const disabled = props.disable_widget || isVerified || sending || !props.row.Email || props.otp_active || linkActive;

    // Tell the parent when the link timer starts/stops, so it can lock the OTP side
    useEffect(() => {
        if (props.onLinkActive) props.onLinkActive(props.row.id, linkActive && !isVerified);
    }, [linkActive, isVerified]);

    // Countdown tick
    useEffect(() => {
        if (!linkActive || isVerified) return;
        const tick = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(tick);
    }, [linkActive, isVerified]);

    // While the link timer runs, check CRM to see if the customer has clicked the link
    useEffect(() => {
        if (!linkActive || isVerified) return;
        const poll = setInterval(() => {
            window.ZOHO.CRM.API.getRecord({
                Entity: "Accounts", approved: "both", RecordID: props.curr_record_id
            }).then(function (data) {
                const rows = (data && data.data && data.data[0] && data.data[0].Subform_8) || [];
                const fresh = rows.find(r => r.id === props.row.id);
                if (fresh && fresh.OTP_validation_status === "Yes") {
                    clearInterval(poll);
                    setMessage("");
                    props.onVerified(); // parent reloads the table
                }
            });
        }, POLL_INTERVAL_MS);
        return () => clearInterval(poll);
    }, [linkActive, isVerified]);

    function handleSendLink() {
        setSending(true);
        setMessage("");

        var func_name = "send_email_verification_link";
        var req_data = {
            "arguments": JSON.stringify({
                "app_id": props.row.Applicant.id, // Applicant lookup id on the subform row
                "email": props.row.Email,
                "loanid": props.curr_record_id
            })
        };

        window.ZOHO.CRM.FUNCTIONS.execute(func_name, req_data)
            .then(function (data) {
                console.log("send link response", data);
                let output = {};
                try {
                    output = JSON.parse(data.details.output);
                } catch (e) {
                    output = { status: false, message: "Unexpected response" };
                }
                if (data.code === "success" && output.status === true) {
                    setMessage("");
                    setNow(Date.now());
                    setSentAt(Date.now()); // start the link timer (CRM has Link_Sent_At = now)
                } else {
                    setMessage(output.message || "Failed to send link");
                }
            })
            .catch(e => {
                console.log("catch in send link:", e);
                setMessage("Failed to send link");
            })
            .finally(() => setSending(false));
    }

    const mm = Math.floor(remainingMs / 60000);
    const ss = Math.floor((remainingMs % 60000) / 1000);

    return (
        <Grid container direction="column" alignItems="center" sx={{ mt: 1 }}>
            <Grid item>
                {sending ?
                    <CircularProgress size={24} />
                    :
                    <Button size="small" variant="outlined" disabled={disabled}
                        style={{
                            backgroundColor: disabled ? "darkgrey" : "#013f88",
                            color: "white",
                            border: 'unset',
                            width: 150 // same width as "Send OTP"
                        }}
                        onClick={handleSendLink}>
                        {sentAt ? "Resend email link" : "Send email link"}
                    </Button>
                }
            </Grid>
            {!isVerified && linkActive &&
                <Grid item sx={{ fontSize: '0.8rem', color: '#1976d2', mt: 0.5, textAlign: 'center' }}>
                    Waiting for customer to click the link<br />
                    Time Remaining: {mm < 10 ? `0${mm}` : mm}:{ss < 10 ? `0${ss}` : ss}
                </Grid>
            }
            {!isVerified && !linkActive && message &&
                <Grid item sx={{ fontSize: '0.8rem', color: '#d32f2f', mt: 0.5, textAlign: 'center' }}>
                    {message}
                </Grid>
            }
        </Grid>
    )
}