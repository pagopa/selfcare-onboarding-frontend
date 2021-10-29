import {AppBar, Button, SvgIcon, Toolbar} from '@mui/material';
import {Box} from "@mui/system";
import {ReactComponent as logo} from '../assets/logo_pago_pa_mini.svg';
// import { URL_FE_LOGOUT } from '../lib/constants';

const Header = () => (
    <AppBar position="relative" sx={{alignItems:"center"}}>
        <Toolbar sx={{ width:{xs:"100%",lg:"90%"} }}>
            <SvgIcon component={logo} viewBox="0 0 80 24" sx={{ width: '80px' }} />
            <Box sx={{ flexGrow: 1, textAlign: 'end' }}>
                <Button variant="contained">
                    Esci
                </Button>
            </Box>
        </Toolbar>
    </AppBar>
);

export default Header;
