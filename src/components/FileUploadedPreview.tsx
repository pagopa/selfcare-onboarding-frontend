import {Box} from "@mui/system";
import {Grid, Tooltip, Typography} from "@mui/material";
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';

type FileUploadedPreviewParams = {
    files: Array<File>;
    sx?: any;
    deleteUploadedFiles: ((event: any) => void) | undefined;
    loading: boolean;
};


export function  FileUploadedPreview({files, sx, deleteUploadedFiles, loading}: FileUploadedPreviewParams): JSX.Element {

    const cleanFileType = (fileType: string): string => {
        // eslint-disable-next-line functional/no-let
        let type = fileType;
        if (fileType.includes("application/")) {
            type = type.replace("application/", "");
        }
        return type;
    };

    return (
        <>
            {files.map((file: File) => (
                <Box key={file.name} sx={{maxWidth: {xs: 300, md: 500, lg: 900}, ...sx}}>
                    <Grid container direction={"row"}>
                        <DescriptionOutlinedIcon
                            sx={{color: '#ADB7C0', width: "auto", height: "24px", marginRight: 0.5}}/>
                        <Typography
                            sx={{
                                fontStyle: "normal",
                                fontWeight: 600,
                                fontSize: "14px",
                                lineHeight: "24px",
                                textTransform: "uppercase",
                                color: "info.main",

                            }} variant={"h4"} align="left">
                            {`${cleanFileType(file.type)} (${(file.size / Math.pow(1024, 2)).toFixed(2)} MB)`}
                        </Typography>
                    </Grid>

                    <Grid container direction={"row"} justifyItems={"center"} alignItems={"center"}>
                        <Tooltip title={file.name}>
                            <Typography
                                sx={{
                                    lineHeight: "37px",
                                    color: 'text.primary',
                                    fontStyle: 'normal',
                                    overflow: "hidden",
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis",
                                    maxWidth: {xs: 250, md: 450, lg: 850}

                                }}
                                variant={"h4"} align="left">
                                {file.name}
                            </Typography>
                        </Tooltip>
                        <ClearOutlinedIcon onClick={deleteUploadedFiles}
                                           sx={{
                                               mt: 0.5,
                                               ml: 1,
                                               color: "primary.main",
                                               fontSize: "24px"
                                           }}></ClearOutlinedIcon>
                    </Grid>

                    <Typography
                        sx={{
                            lineHeight: "20px",
                            color: 'info.main',
                            fontStyle: loading ? 'italic' : 'normal'
                        }}
                        variant={"body2"} align="left">
                            {/* TODO: ask if text ok 'caricamento completato' is correct */}
                        {loading ? 'Invio in corso...' : 'Caricamento completato'}
                    </Typography>
                </Box>))}
        </>
    );
}