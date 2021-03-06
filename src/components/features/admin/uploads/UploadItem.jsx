import React from 'react';
import styled from '@emotion/styled';
import { fontSizes } from '../../../../utils/style-helpers';
import { pallet, spacing } from '../../../../constants/style-guide';
import { getSmallUploadSrc } from '../../../../utils/upload-helpers';

const Wrapper = styled('div')`
  cursor: pointer;
  padding: ${spacing.regular}px;
  &:hover {
    background-color: ${pallet.light.strawberry};
  }
`;

const Title = styled('div')`
  ${fontSizes('small')};
`;

const ThumbnailWrapper = styled('div')`
  text-align: center;
`;
const Thumbnail = styled('img')``;

export const UploadItem = ({ item }) => {
  return (
    <Wrapper onClick={item.onClick}>
      <ThumbnailWrapper>
        <Thumbnail src={getSmallUploadSrc(item)} />
      </ThumbnailWrapper>
      <Title>{item.title}</Title>
    </Wrapper>
  );
};
