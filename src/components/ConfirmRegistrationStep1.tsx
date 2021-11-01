import {Grid, Typography} from "@mui/material";
import {useDropzone} from 'react-dropzone';
import {Box} from "@mui/system";
import uploadImage from '../assets/upload_doc.png';
import uploadedImage from '../assets/uploaded_doc.png';
import {FileUploadedPreview} from "./FileUploadedPreview";
import {useHistoryState} from "./useHistoryState";
import {AlertDialog} from "./AlertDialog";


export function ConfirmRegistrationStep1() {

    const onDropAccepted = (acceptedFiles: Array<File>) => {
        setUploadedFiles(acceptedFiles);
    };

    const onDropRejected = () => {
        setDialogTitle("Controlla il Documento");
        setDialogDescription("E' possibile caricare un solo file di tipo PDF");
        setShowDialog(true);
    };


    const {getRootProps, getInputProps} = useDropzone({onDropAccepted, onDropRejected, maxFiles: 1});
    const [uploadedFiles, setUploadedFiles] = useHistoryState<Array<File>>(
        'uploaded_files',
        []
    );
    const [showDialog, setShowDialog] = useHistoryState<boolean>(
        'show_dialog',
        false
    );
    const [dialogTitle, setDialogTitle] = useHistoryState<string|null>(
        'dialog_title_confirm_registration_1',
        null
    );
    const [dialogDescription, setDialogDescription] = useHistoryState<string|null>(
        'dialog_desription_confirm_registration_1',
        null
    );

    const handleCloseDialog = (): void => {
        setShowDialog(false);
    };

    const deleteUploadedFiles = () => {
        setUploadedFiles([]);
    };

    // const files: Array<JSX.Element>  = acceptedFiles.map((file: File) => (
    //     <li key={file.name}>
    //         {file.name} - {file.size} bytes
    //     </li>
    // ));


    // const onForwardAction = () => {
    //     forward();
    // };
    //
    // const files = acceptedFiles.map(file => (
    //     <li key={file.path}>
    //         {file.path} - {file.size} bytes
    //     </li>
    // ));

    const subtitle1 = "Per completare la procedura di adesione, inserisci qui l'accordo ricevuto via PEC,";
    const subtitle2 = "firmato digitalmente dal Legale Rappresentante.";

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

            <Grid container direction="row" justifyItems={"center"} alignItems={"center"} sx={{mt: "56px"}}>
                <div {...getRootProps({className: 'dropzone'})}>
                    <input {...getInputProps()} />
                    <img width="180px" src={uploadedFiles && uploadedFiles.length > 0 ? uploadedImage : uploadImage}/>
                </div>

                {uploadedFiles && uploadedFiles.length > 0 ? (
                    <FileUploadedPreview files={uploadedFiles} deleteUploadedFiles={deleteUploadedFiles}
                                         sx={{ml: "27px"}}/>
                ) : (
                    <Grid container direction="column" alignItems={"center"} sx={{width: "auto", ml: "27px"}}>
                        <Typography
                            sx={{
                                color: "#17324D",
                                lineHeight: "36,5px"
                            }} variant={"h4"} align="left">
                            Trascina qui l’Atto di Adesione firmato
                        </Typography>
                        <Typography
                            sx={{
                                lineHeight: "20px",
                                fontWeight: "normal",
                                color: "secondary.main"
                            }}
                            variant={"body2"} align="left">
                            oppure selezionalo dal desk
                        </Typography>

                    </Grid>

                )}
            </Grid>


            <AlertDialog open={showDialog} handleClose={handleCloseDialog}
                         description={dialogDescription}
                         title={dialogTitle}/>
        </Box>

    );
}