import styled from "styled-components/macro";
import { device } from "../../../styles/mediaQueries";

export const StyledPaper = styled.div`
  position: absolute;
  height: -webkit-fill-available;
  z-index: 2000;
  transition: all 0.5s ease;
  overflow-y: scroll;
  width: 100%;

  top: ${(p) => (p.listIsVisible ? "0" : "100%")};
  @media ${device.phone} {
    position: fixed;
  }
`;

export const PaperContainer = styled.div`
  position: relative;
  padding-top: 40px;
  padding-bottom: 40px;
  background-color: #fdf3b6;
  z-index: 500;
  min-height: 100%;
  /* font-family: $ff-cedearville; */
  text-transform: capitalize;

  &::before {
    content: "";
    width: 2px;
    height: 100%;
    position: absolute;
    top: 0;
    left: 40px;
    background-color: rgba(255, 0, 0, 0.6);
  }
`;

export const PaperButton = styled.button`
  border: none;
  background-color: transparent;
  border-radius: 5px;
  transition: 0.3s ease all;
  color: #b1b1b1;
  position: absolute;
  right: 1rem;
  top: 1rem;

  &:hover {
    background-color: rgba($color-black, 0.3);
    color: $color-primary;
  }

  & svg {
    height: 2rem;
    width: 2rem;
  }
`;

export const Pattern = styled.div`
  min-height: 31rem;
  background-image: repeating-linear-gradient(#fdf3b6 0px, #fdf3b6 24px, teal 25px);

  @media ${device.phone} {
    background-image: repeating-linear-gradient(#fdf3b6 0px, #fdf3b6 40px, teal 42px);
  }
`;

export const Content = styled.div`
  padding-top: 6px;
  padding-left: 56px;
  padding-right: 16px;
  line-height: 25px;
  font-size: 19px;
  letter-spacing: 1px;
  word-spacing: 5px;

  @media ${device.phone} {
    font-size: 1.7rem;
    line-height: 42px;
  }
`;

/**
 * TodoList
 */

export const StyledTodoList = styled.div`
  display: grid;
  place-content: center;
`;

export const Incomplete = styled.div``;

/**
 * Todo
 */

export const TodoInput = styled.input`
  display: none;
`;

export const TodoCheckbox = styled.span`
  height: 1.2rem;
  width: 1.2rem;
  aspect-ratio: 1;
  border: 3px solid #b1b1b1;
  border-radius: 50%;
  order: 1;
  position: relative;
  align-self: start;
  margin-top: 0.3rem;
`;

export const TodoCheck = styled.span`
  display: block;
  opacity: 0;
  color: $color-primary;
  position: absolute;
  top: -1rem;
  right: -0.9rem;
  transition: opacity cubic-bezier(1, 0, 0, 1);

  svg {
    height: 2.2rem;
    width: 2.2rem;
  }
`;

export const StyledTodo = styled.div`
  display: flex;
  justify-content: space-between;

  ${TodoInput}:checked ~ ${TodoCheckbox} > ${TodoCheck} {
    opacity: 1;
  }
`;

export const CheckboxLabel = styled.label`
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;

  transition: 1s all ease-in-out;

  ${(p) =>
    p.isChecked &&
    `text-decoration: line-through;
      text-decoration-color: $color-grey-dark;
      color: $color-grey-dark;
      `}

  @media ${device.phone} {
    width: 90%;
  }
`;
