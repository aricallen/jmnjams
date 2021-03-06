import React from 'react';
import styled from '@emotion/styled';
import { pallet, spacing } from '../../../constants/style-guide';
import { fontSizes } from '../../../utils/style-helpers';
import { ButtonLink } from '../../common/Links';
import { Overlay, DesktopOnly } from '../../common/Structure';

const PICTURE_HEIGHT = 600;

const Wrapper = styled('div')`
  display: flex;
  justify-content: center;
  position: relative;
  background-color: ${pallet.charcoal};
  height: ${PICTURE_HEIGHT}px;
  margin-top: -64px;
`;

const CallToAction = styled('div')`
  padding: ${spacing.double}px;
  color: white;
  text-align: center;
  ${fontSizes(64)}
`;

const ButtonWrapper = styled('div')`
  text-align: center;
  ${fontSizes('largest')}
`;

const Text = styled('div')``;

const Img = styled('img')`
  width: 100%;
  object-fit: cover;
`;

export const HeroSection = () => {
  return (
    <Wrapper>
      <Overlay>
        <CallToAction>
          <Text>Jam. Music. Delivered.</Text>
          <DesktopOnly>
            <ButtonWrapper>
              <ButtonLink variant="secondary" to="/store" style={{ fontWeight: 700 }}>
                Sign up
              </ButtonLink>
            </ButtonWrapper>
          </DesktopOnly>
        </CallToAction>
      </Overlay>
      <Img src="/assets/images/hero-image.jpeg" />
    </Wrapper>
  );
};
