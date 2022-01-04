import styled from "styled-components/macro";
import {
  colorBlack,
  colorDelete,
  colorSecondary,
  colorTertiary,
  colorWhite
} from "./GlobalVariables";

export const AddBtnSubmit = styled.button`
  padding: 1rem 2rem;
  border: none;
  display: flex;
  align-items: center;
  border-radius: 5px;
  transition: all ease-in-out 0.4s;
  align-self: center;
  margin-bottom: 1rem;
  cursor: pointer;
  color: ${({ theme }) => theme.primary};

  & span {
    color: ${colorBlack};
    height: 1.5rem;
    width: 1.5rem;
    margin-left: 0.5rem;
    transition: all ease-in-out 0.3s;
  }
  &:hover {
    background-color: ${colorSecondary};

    & span {
      color: ${colorWhite};
    }
  }

  &:disabled:hover {
    background-color: ${colorDelete};
  }
`;

export const xSVGButton = styled.button`
  border: none;
  background-color: ${colorTertiary};
  display: inline-grid;
  place-items: center;
  transform: rotate(45deg);
  border-radius: 50%;
  padding: 0.6rem;
  transition: all ease-in-out 0.3s;
  cursor: pointer;

  &:hover {
    background-color: ${colorSecondary};
    color: ${colorWhite};
  }
`;
