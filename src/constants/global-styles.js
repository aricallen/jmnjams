import { css } from '@emotion/core';
import { pallet, animation } from './style-guide';

export const globalStyles = css`
  html,
  body {
    width: 100%;
    min-height: 100vh;
  }

  body,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  ol,
  ul,
  a,
  li {
    line-height: 1.42em;
  }

  .anton {
    font-family: 'Anton', sans-serif;
  }

  .fjalla {
    font-family: 'Fjalla One', sans-serif;
  }

  .libre-franklin {
    font-family: 'Libre Franklin', sans-serif;
  }

  a {
    color: ${pallet.strawberry};
    text-decoration: none;
    transition: color ${animation};
    &:hover {
      color: ${pallet.light.strawberry};
    }
  }
`;
