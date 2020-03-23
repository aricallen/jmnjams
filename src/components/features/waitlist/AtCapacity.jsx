import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useDispatch } from 'react-redux';
import {
  Header1,
  Section,
  Paragraph,
  Emphasis,
  Emoji,
  FullPageWrapper,
} from '../../common/Structure';
import { spacing } from '../../../constants/style-guide';
import { addToWaitlist } from '../../../services/adapter';
import { WaitlistForm } from './WaitlistForm';
import { media } from '../../../utils/media';
import { addMember } from '../../../redux/email/actions';

const ContentWrapper = styled(FullPageWrapper)`
  padding: ${spacing.quadruple}px 0;
  animation: fade-in 0.5s 1;
`;

const FormWrapper = styled('div')`
  width: 50%;
  ${media.mobile()} {
    width: 100%;
  }
`;

export const AtCapacity = ({ history }) => {
  const dispatch = useDispatch();

  const signupForNewsLetter = (values) => {
    const { email, firstName, lastName } = values;
    dispatch(addMember({ email, firstName, lastName, tags: ['Newsletter'] }));
  };

  const onSubmit = async (values) => {
    try {
      await addToWaitlist({ values, formSource: 'At capacity waitlist' });
      history.push('/thank-you');
    } catch (err) {
      console.error(err);
    }
    if (values.newsletterSignup) {
      signupForNewsLetter(values);
    }
  };

  return (
    <ContentWrapper>
      <Header1>Oh noes! We are at full capacity. 😩</Header1>
      <Section>
        <Paragraph>
          First, we are <Emphasis>absolutely thrilled</Emphasis> you want some of our jam.{' '}
          Unfortunately, our jam production is on such a small scale and are only able to support a
          limited set of subscriptions (for now!).
        </Paragraph>
        <Paragraph>
          But fear not! <Emoji label="Muscle emoji">💪🏽</Emoji> Fill out the form below to join our
          waitlist and be first in line for when we expand. Also be sure to sign up for our
          newsletter so you can stay up to date on our #jamjourneys.
        </Paragraph>
      </Section>

      <Section>
        <FormWrapper>
          <WaitlistForm onSubmit={onSubmit} />
        </FormWrapper>
      </Section>
    </ContentWrapper>
  );
};