import React from 'react';
import styled from '@emotion/styled';
import { pallet, spacing, border } from '../../constants/style-guide';
import { NewsletterForm } from './NewsletterForm';
import { media } from '../../utils/media';
import { fontSizes } from '../../utils/style-helpers';

const Wrapper = styled('div')`
  border: ${border};
  border-radius: ${spacing.regular}px;
  overflow: hidden;
  ${media.mobile()} {
    width: 100%;
    margin-bottom: ${spacing.quadruple}px;
  }
`;

const Header = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${spacing.regular}px;
  background-color: ${pallet.strawberry};
`;

const HeaderText = styled('h2')`
  color: white;
  margin-bottom: 0;
  ${fontSizes('large')}
`;

const ContentWrapper = styled('div')`
  padding: ${spacing.double}px;
`;

const FormWrapper = styled('div')`
  margin-top: ${spacing.double}px;
`;

const Message = styled('span')`
  ${fontSizes('small')}
`;

export const NewsletterBlock = () => {
  return (
    <Wrapper>
      <Header>
        <HeaderText>#jamjourneys newsletter</HeaderText>
      </Header>
      <ContentWrapper>
        <Message>
          Sign up for our newsletter to stay up to date on the latest flavors, features, music and
          adventures.
        </Message>
        <FormWrapper>
          <NewsletterForm />
        </FormWrapper>
      </ContentWrapper>
    </Wrapper>
  );
};
