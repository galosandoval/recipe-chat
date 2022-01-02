import { createGlobalStyle } from "styled-components/macro";
import { ffRoboto } from "./typography";

export const GlobalStyles = createGlobalStyle`
 // COLORS
$color-primary: #ff6347;
$color-primary-light: #ff9785;
$color-primary-dark: #ff5233;

$color-secondary: #20bf55;
$color-secondary-light: #3fde74;
$color-secondary-dark: #157a37;

$color-tertiary: antiquewhite;

$color-delete: #a50104;

$color-grey-light-1: #f7f7f7;
$color-grey-light-2: #eee;

$color-grey-dark: rgb(177, 177, 177);
$color-grey-dark-2: #777;
$color-grey-dark-3: #333;

$color-white: #fff;
$color-black: #000;

// FONT
$ff-lobster: "Lobster Two", cursive;
$ff-montserrat: "Montserrat", sans-serif;
/* $ff-cedearville: "Cedarville Cursive", cursive; */

/* Box sizing rules */
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* Remove default margin */
body,
h1,
h2,
h3,
h4,
p,
figure,
blockquote,
dl,
dd {
  margin: 0;
}

/* Remove list styles on ul, ol elements with a list role, which suggests default styling will be removed */
ul[role="list"],
ol[role="list"] {
  list-style: none;
}

/* Set core root defaults */
html:focus-within {
  scroll-behavior: smooth;
}

/* Set core body defaults */
body {
  min-height: 100vh;
  text-rendering: optimizeSpeed;
  line-height: 1.5;
  background-color: $color-tertiary;
  font-family: $ff-montserrat;
}

/* A elements that don't have a class get default styles */
a:not([class]) {
  text-decoration-skip-ink: auto;
}

/* Make images easier to work with */
img,
picture {
  max-width: 100%;
  display: block;
}

/* Inherit fonts for inputs and buttons */
input,
button,
textarea,
select {
  font: inherit;
}

@media (prefers-reduced-motion: reduce){
   html:focus-within {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
`;
