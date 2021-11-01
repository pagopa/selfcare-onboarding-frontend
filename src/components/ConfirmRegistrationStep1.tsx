import {Button, Grid, Typography} from "@mui/material";
import {Box} from "@mui/system";
import {AlertDialogActions, StepperStepComponentProps} from "../../types";
import {FileUploader} from "./FileUploader";


export function ConfirmRegistrationStep1({
                                             setDialogTitle,
                                             setDialogDescription,
                                             setShowDialog
                                         }: AlertDialogActions, {forward}: StepperStepComponentProps,{loading} : any,
                                         {uploadedFiles,setUploadedFiles} : any) {

    const onDropAccepted = (acceptedFiles: Array<File>) => {
        setUploadedFiles(acceptedFiles);
    };


    const onDropRejected = () => {
        setDialogTitle("Controlla il Documento");
        setDialogDescription("E' possibile caricare un solo file di tipo PDF");
        setShowDialog(true);
    };

    const onSubmit = ():void =>{
        forward(uploadedFiles[0]);
    };


    const deleteUploadedFiles = (): void => {
        setUploadedFiles([]);
    };


    const subtitle1 = "Per completare la procedura di adesione, inserisci qui l'accordo ricevuto via PEC,";
    const subtitle2 = "firmato digitalmente dal Legale Rappresentante.";
    const uploaderImageWidth = 180;

    return (

        <Box sx={{minHeight: "50vh", mt: "64px"}}>
            <Grid container direction="row" justifyContent={"flex-start"} alignItems={"center"}>
                <Grid item xs={12}>
                    <Typography sx={{
                        lineHeight: "48px",
                        letterSpacing: "-0.5px",
                        color: "#17324D"
                    }} variant={"h2"} align="left">
                        {"Carica l'Atto di Adesione"}
                    </Typography>

                    <Typography
                        sx={{
                            color: "#17324D",
                            mt: 3,
                            lineHeight: "24px"
                        }} variant={"body2"} align="left">
                        {subtitle1}
                    </Typography>

                    <Typography sx={{
                        color: "#17324D",
                        mt: 0,
                        lineHeight: "24px"
                    }} variant={"body2"} align="left">
                        {subtitle2}
                    </Typography>
                </Grid>
            </Grid>


            <FileUploader title={"Trascina qui l’Atto di Adesione firmato"}
                          description={"oppure selezionalo dal desk"}
                          uploadedFiles={uploadedFiles} deleteUploadedFiles={deleteUploadedFiles}
                          onDropAccepted={onDropAccepted}
                          onDropRejected={onDropRejected}
                          accept={['application/pdf']}
                          uploaderImageWidth={uploaderImageWidth}
                          loading={loading}
            />

            <Button sx={{mt: 8, width: 180}} color="primary" variant="contained"
                    disabled={!(uploadedFiles && uploadedFiles.length > 0)} onClick={() => onSubmit()}>
                Invia
            </Button>

        </Box>

    );
}