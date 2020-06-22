import styled from '@emotion/styled';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { addToCart, removeFromCart } from '../../../redux/cart/actions';
import { isResolved } from '../../../utils/meta-status';
import { Spinner, Content } from '../../common';
import { CartPreview } from './CartPreview';
import { ProductItem } from './ProductItem';
import { fetchProducts } from '../../../redux/products/actions';
import { media } from '../../../utils/media';
import { fontSizes } from '../../../utils/style-helpers';
import { spacing, pallet } from '../../../constants/style-guide';

const Wrapper = styled('div')``;

const ListWrapper = styled('div')`
  display: grid;
  grid-template-columns: ${(p) => (p.hasCart ? '3fr 1fr' : '100%')};
  ${media.mobile()} {
    display: block;
  }
`;

const List = styled(Content)`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding-top: 0;
`;

const Img = styled('img')`
  width: 100%;
  object-fit: cover;
`;

const Top = styled('div')`
  display: flex;
  justify-content: center;
`;

const TopContent = styled('div')`
  width: 50%;
  ${media.mobile()} {
    width: 100%;
  }
`;

const OrgLinkWrapper = styled('div')`
  padding: ${spacing.quadruple * 3}px;
  padding-top: ${spacing.double}px;
`;

const Credit = styled('div')`
  font-size: ${fontSizes('small')};
  font-style: italic;
`;

const TextBlock = styled('p')`
  margin-top: ${spacing.double}px;
  text-align: justify;
`;

const Bold = styled('b')`
  color: ${pallet.strawberry};
`;

const Bottom = styled('div')``;

export const Store = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const productsState = useSelector((state) => state.products);
  const cart = useSelector((state) => state.cart.data);

  useEffect(() => {
    dispatch(fetchProducts());
  }, []);

  const onAddItem = (item) => {
    dispatch(addToCart(item));
  };

  const onRemoveItem = (item) => {
    dispatch(removeFromCart(item));
  };

  const onCheckout = () => {
    history.push({ pathname: '/store/checkout' });
  };

  if (!isResolved(productsState.meta)) {
    return <Spinner variant="large" />;
  }

  return (
    <Wrapper>
      <Top>
        <TopContent>
          <Img src="/assets/uploads/large/cantaloupe.jpeg" />
          <Credit>Art by Shireen Tofig</Credit>
          <TextBlock>Dear Friends,</TextBlock>

          <TextBlock>
            For the whole month of July we are donating <Bold>100% of our sales</Bold> to
            ARTogether&apos;s #InUnison campaign!
          </TextBlock>

          <TextBlock>
            ARTogether is leading a community engagement initiative in the East Oakland
            neighborhoods that will bring together people of refugees, Latinx, Black and LGBTQIA
            backgrounds to{' '}
            <Bold>connect through shared values and common challenges through Art</Bold>.
          </TextBlock>

          <TextBlock>
            Many immigrant communities have traditionally not been very vocal about protecting other
            minority groups. The same systems of oppression and fear that marginalize Black
            communities also contributed to developing a lack of interaction and trust among all
            individuals. But we are changing that. Jam sales will be contributing to creating a safe
            space, facilitated by trauma-informed healthcare professionals, community leaders, and
            art practitioners for discussing inter sectional issues including displacement and
            gentrification; police, military and ICE brutality; access to health care; economic
            disparity; overt and covert racism; and misinformation and prejudice between communities
            of color.
          </TextBlock>
          <TextBlock>
            Click on the link below or visit{' '}
            <a href="artogether.org" target="_blank" rel="noopener noreferrer">
              artogether.org
            </a>{' '}
            to learn more.
          </TextBlock>
          <OrgLinkWrapper>
            <a href="artogether.org" target="_blank" rel="noopener noreferrer">
              <Img src="/assets/uploads/medium/artogether.png" />
            </a>
          </OrgLinkWrapper>
        </TopContent>
      </Top>
      <Bottom>
        <ListWrapper hasCart={cart.length > 0}>
          <List>
            {productsState.data.map((product) => (
              <ProductItem
                key={product.id}
                product={product}
                onAddItem={onAddItem}
                onRemoveItem={onRemoveItem}
              />
            ))}
          </List>
          <CartPreview onCheckout={onCheckout} />
        </ListWrapper>
      </Bottom>
    </Wrapper>
  );
};
