import styled from "styled-components/macro";

export const AddBtnSubmit = styled.button`
  padding: 1rem 2rem;
  background-color: $color-white;
  border: none;
  display: flex;
  align-items: center;
  border-radius: 5px;
  transition: all ease-in-out 0.4s;
  align-self: center;
  margin-bottom: 1rem;
  cursor: pointer;

  & span {
    color: $color-black;
    height: 1.5rem;
    width: 1.5rem;
    margin-left: 0.5rem;
    transition: all ease-in-out 0.3s;
  }
  &:hover {
    background-color: $color-secondary;
    color: $color-white;

    & span {
      color: $color-white;
    }
  }

  &:disabled:hover {
    background-color: $color-delete;
  }
`;