import React from 'react';
import styled from '@emotion/styled';
import { spacing } from '../../constants/style-guide';

export const Content = styled('div')`
  width: 100%;
  padding: ${spacing.quadruple}px;
`;

export const Header1 = styled('h1')`
  margin-top: ${spacing.regular}px;
  margin-bottom: ${spacing.regular}px;
`;

export const Section = styled('section')`
  margin-top: ${spacing.double}px;
`;

export const Paragraph = styled('p')`
  margin-top: ${spacing.double}px;
`;

export const Emphasis = styled('span')`
  font-style: italic;
  font-weight: bold;
`;

export const Emoji = ({ label, children }) => {
  return <span aria-label={label}>{children}</span>;
};
