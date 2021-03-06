import styled from '@emotion/styled';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useInView } from 'react-intersection-observer';
import { useHistory } from 'react-router-dom';
import { addToCart, removeFromCart } from '../../../redux/cart/actions';
import { isResolved } from '../../../utils/meta-status';
import { Spinner, Content, MobileOnly, Button } from '../../common';
import { CartPreview } from './CartPreview';
import { ProductItem } from './ProductItem';
import { fetchProducts } from '../../../redux/products/actions';
import { media } from '../../../utils/media';
import { spacing, pallet } from '../../../constants/style-guide';

const Wrapper = styled('div')``;

const ListWrapper = styled('div')`
  ${media.desktop()} {
    display: grid;
    grid-template-columns: ${(p) => (p.hasItems ? '3fr 1fr' : 'auto')};
  }
`;

// only for mobile
const FloatingButton = styled('div')`
  position: fixed;
  top: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  padding-top: ${spacing.double}px;
  padding-bottom: ${spacing.double}px;
  z-index: 2;
  background-color: ${pallet.strawberry};
  opacity: 0;
  animation: fade-in 0.3s 1;
  &.in-view {
    opacity: 1;
  }
  & button {
    width: 80%;
  }
`;

const ItemWrapper = styled('div')`
  padding: ${spacing.quadruple}px;
  padding-top: 0;
  width: 30%;
  ${media.mobile()} {
    width: 100%;
  }
`;

const List = styled(Content)`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding-top: 0;
`;

const Top = styled('div')`
  display: flex;
  justify-content: center;
  position: relative;
`;

const Counter = styled('span')`
  display: inline-block;
  border-radius: 50%;
  background: ${pallet.strawberry};
  color: ${pallet.background};
  margin-left: ${spacing.regular}px;
  padding: 2px 6px;
`;

const Bottom = styled('div')``;

export const Store = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [ref, inView] = useInView();
  const productsState = useSelector((state) => state.products);
  const cart = useSelector((state) => state.cart.data);
  const hasItems = cart.length > 0;
  const showFloatingCheckout = hasItems && inView;

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

  const totalItems = cart.reduce((total, curr) => total + curr.selectedQty, 0);

  return (
    <Wrapper>
      <Top>
        <MobileOnly>
          {hasItems && (
            <FloatingButton
              inView={inView}
              className={showFloatingCheckout ? 'in-view' : 'not-in-view'}
            >
              <Button onClick={onCheckout} variant="secondary">
                Checkout <Counter>{totalItems}</Counter>
              </Button>
            </FloatingButton>
          )}
        </MobileOnly>
      </Top>
      <Bottom ref={ref}>
        <ListWrapper hasItems={hasItems}>
          <List>
            {productsState.data.map((product) => (
              <ItemWrapper key={product.id}>
                <ProductItem product={product} onAddItem={onAddItem} onRemoveItem={onRemoveItem} />
              </ItemWrapper>
            ))}
          </List>
          <CartPreview onCheckout={onCheckout} />
        </ListWrapper>
      </Bottom>
    </Wrapper>
  );
};
