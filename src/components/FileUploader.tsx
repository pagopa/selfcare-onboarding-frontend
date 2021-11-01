import {Grid, Typography} from "@mui/material";
import {DropEvent, FileRejection, useDropzone} from "react-dropzone";
import uploadedImage from "../assets/uploaded_doc.png";
import uploadImage from "../assets/upload_doc.png";
import {FileUploadedPreview} from "./FileUploadedPreview";

type FileUploaderOption = {
    title: string;
    description: string;
    uploadedFiles: Array<File>;
    deleteUploadedFiles?: (event: any|undefined) => void;
    onDropAccepted?: (t: Array<File>) => void;
    onDropRejected?: (fileRejections: Array<FileRejection>, event?: DropEvent) => void;
    maxFiles?: number;
    accept?: Array<string>|undefined;

};

export function FileUploader({
                                 title,
                                 description,
                                 uploadedFiles,
                                 deleteUploadedFiles,
                                 onDropAccepted,
                                 onDropRejected,
                                 maxFiles,
                                 accept
                             }: FileUploaderOption) {
    const {getRootProps, getInputProps} = useDropzone({
        onDropAccepted,
        onDropRejected,
        maxFiles: maxFiles ? maxFiles : 1,
        accept: accept ? accept : undefined
    });

    return (
        <Grid container direction="row" justifyItems={"center"} alignItems={"center"} sx={{mt: "56px"}}>
            <div {...getRootProps({className: 'dropzone'})}>
                <input {...getInputProps()} />
                <img width="180px" src={uploadedFiles && uploadedFiles.length > 0 ? uploadedImage : uploadImage}/>
            </div>

            {uploadedFiles && uploadedFiles.length > 0 ? (
                <FileUploadedPreview files={uploadedFiles} deleteUploadedFiles={deleteUploadedFiles}
                                     sx={{ml: "27px"}}></FileUploadedPreview>
            ) : (
                <Grid container direction="column" alignItems={"center"} sx={{width: "auto", ml: "27px"}}>
                    <Typography
                        sx={{
                            color: "#17324D",
                            lineHeight: "36,5px"
                        }} variant={"h4"} align="left">
                        {title}
                    </Typography>
                    <Typography
                        sx={{
                            lineHeight: "20px",
                            fontWeight: "normal",
                            color: "secondary.main"
                        }}
                        variant={"body2"} align="left">
                        {description}
                    </Typography>

                </Grid>

            )}
        </Grid>

    );
}