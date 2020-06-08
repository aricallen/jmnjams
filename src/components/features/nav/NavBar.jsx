import React, { useEffect, useRef, Fragment } from 'react';
import styled from '@emotion/styled';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import { sizes, pallet, spacing, border } from '../../../constants/style-guide';
import { isInitial } from '../../../utils/meta-status';
import { fetchSession } from '../../../redux/session/actions';
import CartIcon from '../../../assets/icons/shopping_cart.svg';
import { DesktopOnly, MobileOnly } from '../../common/Structure';
import { MobileNav } from './MobileNav';
import { NavLogo, NavList, NavLink, NavItem, SubNav, IconWrapper } from './Nav';
import { media } from '../../../utils/media';

// column is mobile nav list
const Wrapper = styled('nav')`
  display: grid;
  grid-template-columns: 3fr 1fr 3fr 0px;
  top: 0;
  z-index: 10;
  align-items: center;
  min-height: ${sizes.rowHeight}px;
  max-height: ${sizes.rowHeight}px;
  font-weight: 700;
  background-color: transparent;
  padding-left: ${spacing.quadruple}px;
  padding-right: ${spacing.quadruple}px;
  border-bottom: ${(p) => (p.isHomePage ? 'none' : border)};
  ${media.mobile()} {
    padding-left: ${spacing.double}px;
    padding-right: 0;
  }
`;

const BarSection = styled('div')`
  display: flex;
  align-items: center;
`;

const MobileWrapper = styled('div')`
  display: flex;
  align-items: center;
`;

const MobileListPortal = styled('div')`
  position: absolute;
  left: ${spacing.double}px;
  top: 0;
  width: calc(100vw + ${spacing.double}px);
`;

const NAV_ITEMS = [
  {
    text: 'Blog',
    path: '/jam-journeys',
  },
  {
    text: 'How It Works',
    path: '/p/about/how-it-works',
  },
  {
    text: 'FAQs',
    path: '/p/about/faqs',
  },
  {
    text: 'Store',
    path: '/store',
  },
];

const LOGGED_IN_ITEMS = [
  {
    text: 'Account',
    path: '/account/orders',
  },
  {
    text: 'Sign out',
    path: '/account/sign-out',
  },
];

const LOGGED_IN_ADMIN_ITEMS = [
  {
    text: 'Admin',
    path: '/admin/dashboard',
  },
  {
    text: 'Sign out',
    path: '/account/sign-out',
  },
];

const LOGGED_OUT_ITEMS = [
  {
    text: 'Sign In',
    path: '/account/sign-in',
  },
];

const getNavItems = (navItems, sessionState) => {
  if (sessionState.data.user) {
    const items = sessionState.data.user.isAdmin ? LOGGED_IN_ADMIN_ITEMS : LOGGED_IN_ITEMS;
    return [...navItems, ...items];
  }
  return [...navItems, ...LOGGED_OUT_ITEMS];
};

const renderNavItem = (item, isHomePage) => (
  <NavItem key={item.path}>
    <NavLink
      to={item.path}
      isHomePage={isHomePage}
      activeStyle={{
        color: pallet.strawberry,
      }}
    >
      {item.text}
    </NavLink>
    {item.children ? <SubNav className="sub-nav">{item.children.map(renderNavItem)}</SubNav> : null}
  </NavItem>
);

const Cart = ({ cart }) => {
  const history = useHistory();
  if (cart.length === 0) {
    return null;
  }

  return (
    <IconWrapper onClick={() => history.push('/store/checkout')}>
      <CartIcon />
    </IconWrapper>
  );
};

export const NavBar = () => {
  const sessionState = useSelector((state) => state.session);
  const cart = useSelector((state) => state.cart.data);
  const portalRef = useRef();
  const dispatch = useDispatch();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const fetch = () => {
    if (isInitial(sessionState.meta)) {
      dispatch(fetchSession());
    }
  };
  useEffect(fetch, []);

  const navItems = getNavItems(NAV_ITEMS, sessionState);

  return (
    <Fragment>
      <Wrapper isHomePage={isHomePage}>
        <BarSection style={{ justifyContent: 'flex-start' }}>
          <NavLink to="/">
            <NavLogo isHomePage={isHomePage} />
          </NavLink>
        </BarSection>
        <BarSection />
        <BarSection style={{ justifyContent: 'flex-end' }}>
          {/* desktop nav */}
          <DesktopOnly>
            <NavList>
              {navItems.map((item) => renderNavItem(item, isHomePage))}
              <NavItem style={{ marginLeft: 0 }}>
                <Cart cart={cart} />
              </NavItem>
            </NavList>
          </DesktopOnly>

          {/* mobile nav */}
          <MobileOnly>
            <MobileWrapper>
              <NavItem>
                <Cart cart={cart} />
              </NavItem>
              <MobileNav navItems={navItems} portalRef={portalRef} />
            </MobileWrapper>
          </MobileOnly>
        </BarSection>
        <MobileListPortal ref={portalRef} />
      </Wrapper>
    </Fragment>
  );
};
