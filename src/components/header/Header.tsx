import { useContext } from 'react';
import { AppBar, Button, SvgIcon, Toolbar } from '@mui/material';
import { Box } from '@mui/system';
import { Fragment } from 'react';
import { ReactComponent as logo } from '../../assets/logo.svg';
// import { URL_FE_LOGOUT } from '../../lib/constants';
import { HeaderContext } from '../../lib/context';
import SubHeader from './SubHeader';

// type HeaderProps = {
//   subHeaderVisible: boolean;
//   onLogout?: (() => void) | null;
// };

const Header = () => { 
  const { subHeaderVisible, onLogout } = useContext(HeaderContext);
  return (
  //   <Box sx={{ height: withSecondHeader === true ? '155px' : '48px' }}>
  <Fragment>
    <AppBar
      position="relative"
      sx={{ alignItems: 'center', height: '48px', backgroundColor: '#0059B2' }}
    >
      <Toolbar sx={{ width: { xs: '100%', lg: '90%', minHeight: '48px !important' } }}>
        <SvgIcon component={logo} viewBox="0 0 80 24" sx={{ width: '80px' }} />
        {onLogout !== null ? (
          <Box sx={{ flexGrow: 1, textAlign: 'end' }}>
            <Button
              variant="contained"
              sx={{ width: '88px', backgroundColor: '#004C99', height: '32px' }}
              onClick={onLogout}
            >
              Esci
            </Button>
          </Box>
        ) : (
          ''
        )}
      </Toolbar>
    </AppBar>
    {subHeaderVisible === true ? <SubHeader /> : ''}
  </Fragment>
  /*  </Box> */
);};

export default Header;
