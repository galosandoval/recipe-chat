import { Link } from "react-router-dom";
import styled from "styled-components/macro";
import { device } from "../../styles/mediaQueries";
import { AddBtnSubmit } from "../../styles/shared";

export const StyledLogin = styled.main`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  flex-direction: column;
  position: relative;
`;

export const Background = styled.div`
  height: 60%;
  width: 30%;
  background-color: #fff;
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  z-index: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 0.2rem 0.2rem rgba($color-black, 0.15);
  max-width: 320px;

  @media ${device.phone} {
    width: 100%;
  }
`;

export const PrimaryColor = styled.div`
  background-color: $color-primary;
  position: absolute;
  width: 100%;
  height: 65%;
  z-index: -1;
`;

export const Top = styled.div`
  height: 50%;
  width: 80%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 1rem;

  h1 {
    padding-bottom: 3rem;
    font-size: 1rem;
    color: $color-white;
    font-family: $ff-lobster;
    font-style: italic;
    font-size: 2.9rem;
  }
`;

export const LoginButton = styled(AddBtnSubmit)`
  align-self: stretch;
  height: 5rem;
  border-radius: 7px;
  background-color: $color-primary-dark;
  color: $color-white;
  display: grid;
  place-items: center;
  box-shadow: 0 0.2rem 0.2rem rgba($color-black, 0.15);
  cursor: pointer;
  transition: transform 0ms, background-color 0.3s ease-in-out, color 0.3s ease-in-out;
  margin-bottom: 1rem;

  &:hover {
    background-color: $color-white;
    color: $color-primary-dark;
  }
  &:active {
    transform: translateY(1px);
    box-shadow: none;
  }
`;

export const LoginForm = styled.form`
  background-color: #fff;
  border-radius: 7px;
  width: 80%;
  box-shadow: 0 0.2rem 0.2rem rgba($color-black, 0.15);
  display: grid;
  place-items: center;
  margin: 0 auto;
  gap: 1rem;
`;

export const LoginFormButton = styled.button`
  &-btn {
    align-self: center;
    width: 80%;
    display: grid;
    place-items: center;
    background-color: $color-primary;
    transition: all 0.4s ease-in-out;
    color: $color-white;
    cursor: pointer;

    &:hover {
      background-color: $color-primary-dark;
    }
    &:disabled {
      background-color: $color-grey-dark;
    }
    &:active {
      transition: background-color 0s;
      background-color: $color-primary-light;
    }
  }
`;

export const LoginInput = styled.input`
  width: 80%;
  border: 1px solid $color-grey-dark;
  border-radius: 3px;
  padding: 0.5rem 1rem;
  transition: all 0.4s ease-in-out;

  &:first-child {
    margin-bottom: -0.5rem;
    margin-top: 0.9rem;
  }
  &:focus {
    outline: none;
    box-shadow: 0 0.2rem 0.2rem rgba($color-black, 0.15);
  }
  &::placeholder {
    font-size: 0.9rem;
  }
`;

export const Errors = styled.div`
  p {
    font-size: 0.8rem;
    color: $color-delete;
    text-align: center;
  }
`;

export const RegisterLink = styled(Link)`
  &:visited {
    text-decoration: none;
    color: $color-grey-dark;
    transition: 0.3s ease all;
    &:hover {
      color: $color-primary;
    }
  }
`;

export const RegisterTop = styled(Top)`
  height: 40%;
  width: 80%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 4rem;
`;

export const RegisterForm = styled(LoginForm)`
  gap: 0.5rem;
  & input {
    &:first-child {
      margin-bottom: 0;
      margin-top: 0.9rem;
    }
  }
`;
