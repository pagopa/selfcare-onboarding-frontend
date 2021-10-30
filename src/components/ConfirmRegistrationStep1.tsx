import {Button, Grid, Typography} from "@mui/material";
import {StepperStepComponentProps} from "../../types";

export function ConfirmRegistrationStep1({forward}: StepperStepComponentProps) {


    const onForwardAction = () => {
        forward();
    };

    return (

        <Grid container direction="row" justifyContent={"flex-start"} alignItems={"center"}
              sx={{minHeight: "50vh"}}>
            <Grid item xs={12}>
                <Typography sx={{
                    lineHeight: "48px",
                    letterSpacing: "-0.5px",
                    color: "#17324D"
                }} variant={"h1"} align="left">
                    {"Carica l'Atto di Adesione"}
                </Typography>

                <Typography sx={{
                    lineHeight: "48px",
                    letterSpacing: "-0.5px",
                    color: "#17324D",
                    mt: 3
                }} variant={"subtitle1"} align="left">
                    {"Segui le istruzioni per inviare il documento firmato, servirà a completare l'inserimento del tuo Ente nel portale Self Care."}
                </Typography>

                <Button sx={{mt: 8}} color="primary" variant="contained" onClick={onForwardAction}>
                    Prosegui
                </Button>
            </Grid>
        </Grid>

    );
}