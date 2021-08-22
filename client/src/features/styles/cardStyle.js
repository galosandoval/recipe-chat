import styled from "styled-components";

export const StyledCard = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 40%;
  padding: 2em;
  max-width: 600px;
  height: fit-content;
  .ingredients {
    transition: all ease 0.3s;
    max-height: 300px;
  }
  .hidden {
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.3s ease-in-out;
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
    height: 400px;
    object-fit: cover;
  }
  .carrot {
    width: 20px;
    transform: rotate(90deg);
    cursor: pointer;
  }
  .rotate {
    transform: rotate(270deg);
  }
  .description {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;
