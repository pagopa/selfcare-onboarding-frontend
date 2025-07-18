import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

type Props = { open: boolean };

const Loading4Api = ({ open }: Props) =>
  open ? (
    <div>
      <Backdrop sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={open}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  ) : (
    <></>
  );

export default Loading4Api;
