import styled from "styled-components";

export const StyledCard = styled.div`
  display: flex;
  flex-direction: column;
  /* height: fit-content; */
  justify-content: center;
  max-width: 400px;
  padding: 0em;
  width: 40%;
  background: #fff;
  border-radius: 0.5em;
  box-shadow: 0 0.25em 1em rgb(0 0 0 / 10%);
  overflow: hidden;
  .ingredients {
    transition: all ease-in-out 0.3s;
    max-height: 948px;
  }
  .hidden {
    overflow: hidden;
    max-height: 0;
    transition: all ease-in-out 0.3s;
  }
  .img-container {
    width: 100%;
    object-fit: contain;
  }
  button {
    background: none;
    border: none;
    color: lightgray;
    cursor: pointer;
  }
  img {
    width: 100%;
    height: 20em;
    object-fit: cover;
  }
  .carrot {
    width: 20px;
    transform: rotate(90deg);
    cursor: pointer;
    transition: all ease-in-out 0.3s;
  }
  .rotate {
    transition: all ease-in-out 0.3s;
    transform: rotate(270deg);
  }
  .description {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

export const StyledAccordian = styled.div`
  display: flex;
  flex-direction: column;
  height: fit-content;
`;
