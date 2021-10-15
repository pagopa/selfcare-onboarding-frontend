import React, { FunctionComponent } from 'react';
import { Container, Typography } from '@mui/material';

type ChildrenProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
};

type StyledIntroProps = {
  children: ChildrenProps;
  priority?: 1 | 2 | 3;
  additionalClasses?: string;
};

function priorityToTag(priority: 1 | 2 | 3): 'h2' | 'h3' | 'h4' {
  // from https://stackoverflow.com/a/33471928
  // Priority 1 is h2, 2 is h3, 3 is h4
  switch (priority) {
    case 1:
      return 'h2';
    case 2:
      return 'h3';
    case 3:
      return 'h4';
  }
}

export const StyledIntro: FunctionComponent<StyledIntroProps> = ({ children, priority = 1 }) => (
  <Container>
    <Typography variant={priorityToTag(priority)} align="center">
      {children.title}
    </Typography>
    {children.description && <Typography align="center">{children.description}</Typography>}
  </Container>
);
