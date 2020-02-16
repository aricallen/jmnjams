import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { Input, Fieldset, Label, FormError } from '../../common/Forms';
import { Button } from '../../common/Button';
import { spacing, ScreenSizes } from '../../../constants/style-guide';
import { media } from '../../../utils/media';
import { loginUser } from '../../../redux/session/actions';
import { MetaStatus } from '../../../constants/meta-status';

const Wrapper = styled('div')`
  width: 100%;
  display: flex;
  justify-content: center;
  padding-top: 6%;
`;

const LogInWrapper = styled('div')`
  ${media.min(ScreenSizes.TABLET)} {
    width: 50%;
  }
  width: 80%;
  padding: ${spacing.quadruple}px;
  max-width: 480px;
`;

const LogInForm = styled('form')``;

const ButtonWrapper = styled('div')`
  margin-top: ${spacing.double}px;
`;

export const LogIn = ({ history }) => {
  const [values, setValues] = useState({});
  const loginError = useSelector((state) => state.session.meta.error);
  const metaStatus = useSelector((state) => state.session.meta.status);
  const dispatch = useDispatch();
  const errorMessage = loginError && loginError.message;

  const handleChange = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value });
  };

  const handleSubmit = async () => {
    try {
      await dispatch(loginUser(values));
      history.push('/admin/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Wrapper>
      <LogInWrapper>
        <LogInForm
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Fieldset>
            <Label>Email</Label>
            <Input type="email" onChange={handleChange('email')} autoComplete="email" />
          </Fieldset>

          <Fieldset>
            <Label>Password</Label>
            <Input
              type="password"
              onChange={handleChange('password')}
              autoComplete="current-password"
            />
          </Fieldset>

          {errorMessage && <FormError>{errorMessage}</FormError>}

          <ButtonWrapper>
            <Button isBusy={metaStatus === MetaStatus.BUSY}>Log in</Button>
          </ButtonWrapper>
        </LogInForm>
      </LogInWrapper>
    </Wrapper>
  );
};