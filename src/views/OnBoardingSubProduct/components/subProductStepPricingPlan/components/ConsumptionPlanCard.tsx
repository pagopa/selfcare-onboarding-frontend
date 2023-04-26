import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export default function ConsumptionPlanCard() {
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      <Card
        sx={{
          width: '448px',
          height: '241px',
          borderBottomRightRadius: '0px',
          borderBottomLeftRadius: '0px',
        }}
      >
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            PIANO A CONSUMO
          </Typography>
        </CardContent>
      </Card>
      <Card sx={{ width: '448px', borderTopRightRadius: '0px', borderTopLeftRadius: '0px' }}>
        <CardActions disableSpacing>
          <Button size="small" onClick={() => handleExpandClick()}>
            Apri
          </Button>
        </CardActions>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>
            <Typography paragraph>Method:</Typography>
            <Typography paragraph>
              Heat 1/2 cup of the broth in a pot until simmering, add saffron and set aside for 10
              minutes.
            </Typography>
          </CardContent>
        </Collapse>
      </Card>
    </>
  );
}
