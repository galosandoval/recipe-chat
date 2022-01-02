import styled, { css } from "styled-components/macro";

/**
 * General
 */
export const gap = css`
  gap: ${(p) => (p.gap ? `${p.gap}rem` : "0")};
`;
export const flex = css`
  display: flex;
`;
export const flexCenter = css`
  display: flex;
  justify-content: center;
  align-items: center;
`;
export const Center = styled.div`
  ${flexCenter}
`;
export const block = css`
  display: block;
`;
export const container = css`
  padding-inline: 2em;
  margin-inline: auto;
  max-width: 80rem;
`;

export const srOnly = css`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

export const flowSpace = css`
  margin-top: ${(p) => (p.space ? `${p.space}rem` : "1rem")};
`;

export const flow = css`
  & > *:where(:not(:first-child)) {
    ${flowSpace}
  }
`;

/**
 * Color Classes
 */
export const bgPrimary = css`
  background-color: hsl(var(--color-primary));
`;
// export const bgAccent = css`
//   background-color: hsl(${colorLight});
// `;
// export const bgWhite = css`
//   background-color: hsl(${colorWhite});
// `;

export const textDark = css`
  color: hsl(var(--color-primary));
`;
// export const textAccent = css`
//   color: hsl(${colorLight});
// `;
// export const textWhite = css`
//   color: hsl(${colorWhite});
// `;
