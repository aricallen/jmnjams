import React from 'react';
import styled from '@emotion/styled';
import { animation, pallet } from '../../constants/style-guide';
import InstagramIcon from '../../assets/icons/instagram.svg';
import MailIcon from '../../assets/icons/mail.svg';
import SoundcloudIcon from '../../assets/icons/soundcloud.svg';
import GithubIcon from '../../assets/icons/github.svg';
import { media } from '../../utils/media';

const Wrapper = styled('div')`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  ${media.mobile()} {
    justify-content: space-around;
  }
`;

const IconLink = styled('a')`
  svg circle,
  svg g.circle-fill {
    transition: fill ${animation};
  }

  &:hover {
    cursor: pointer;
    svg circle,
    svg g.circle-fill {
      fill: ${pallet.light.strawberry};
    }
  }
`;

export const FollowUs = () => {
  return (
    <Wrapper>
      <IconLink target="_blank" href="https://www.instagram.com/jmn_jams/">
        <InstagramIcon />
      </IconLink>
      <IconLink target="_blank" href="mailto:jam@jmnjams.com">
        <MailIcon />
      </IconLink>
      <IconLink target="_blank" href="https://github.com/aricallen/jmnjams">
        <GithubIcon />
      </IconLink>
      <IconLink target="_blank" href="https://soundcloud.com/solstice-sebastian">
        <SoundcloudIcon />
      </IconLink>
    </Wrapper>
  );
};