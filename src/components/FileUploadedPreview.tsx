import {Box} from "@mui/system";
import {Grid, Typography} from "@mui/material";
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';


export function FileUploadedPreview({files, sx,deleteUploadedFiles}: any) {
    return (
        files.map((file: any) => (
            <Box key={file.name} sx={sx}>
                <Grid container direction={"row"}>
                    <DescriptionOutlinedIcon sx={{color: '#ADB7C0', width: "auto", height: "24px", marginRight: 0.5}}/>
                    <Typography
                        sx={{
                            fontStyle: "normal",
                            fontWeight: 600,
                            fontSize: "14px",
                            lineHeight: "24px",
                            textTransform: "uppercase",
                            color: "info.main"
                        }} variant={"h4"} align="left">
                        {`PDF (${(file.size / Math.pow(1024, 2)).toFixed(2)} MB)`}
                    </Typography>
                </Grid>

                <Grid container direction={"row"} justifyItems={"center"} alignItems={"center"}>
                    <Typography
                        sx={{
                            lineHeight: "37px",
                            color: 'text.primary',
                            fontStyle: 'normal'
                        }}
                        variant={"h4"} align="left">
                        {file.name}
                    </Typography>
                    <ClearOutlinedIcon onClick={deleteUploadedFiles}
                        sx={{mt: 0.5, ml: 1, color: "primary.main", fontSize: "24px"}}></ClearOutlinedIcon>
                </Grid>

                <Typography
                    sx={{
                        lineHeight: "20px",
                        color: 'info.main',
                        fontStyle: 'normal'
                    }}
                    variant={"body2"} align="left">
                    {'Caricamento Completato'}
                </Typography>
            </Box>))
    );
}