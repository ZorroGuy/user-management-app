import React, { useEffect } from 'react'
import Grid from '@mui/material/Grid';

export default function DataRow(props) {
    useEffect(() => {
        console.log("Data Row props", props);
    }, [])
    return (
        <Grid container
            direction="row"
            justifyContent="center"
            alignItems="center"
            display={'flex'}
            // spacing={1}
            sx={{ padding: 0.5, borderBottom: '0.5px solid #d7e2ed' }} >
            <Grid item xs={6} style={{ wordWrap: 'break-word' }}>
                {props.data.key}
            </Grid>
            <Grid item xs={6} style={{ wordWrap: 'break-word' }}>
                {props.data.value === null ? <></> : <>{props.data.value}</>}
            </Grid>
        </Grid>
    )
}
