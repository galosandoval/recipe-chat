import { Link } from "react-router-dom";
import styled from "styled-components/macro";
import {
  boxShadow,
  colorDelete,
  colorGrayDark1,
  colorPrimary,
  colorPrimaryDark,
  colorPrimaryLight,
  ffLobster
} from "../../styles/GlobalVariables";
import { device } from "../../styles/mediaQueries";
import { AddBtnSubmit } from "../../styles/shared";

export const StyledLogin = styled.main`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  flex-direction: column;
  position: relative;
  color: ${({ theme }) => theme.primary};
`;

export const Background = styled.div`
  height: 60%;
  width: 30%;
  background-color: ${({ theme }) => theme.primary};
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  z-index: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 0.2rem 0.2rem rgba(var(--color-black) / 0.15);
  max-width: 320px;

  @media ${device.phone} {
    width: 100%;
  }
`;

export const PrimaryColor = styled.div`
  background-color: ${colorPrimary};
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
    font-family: ${ffLobster};
    font-style: italic;
    font-size: 2.9rem;
  }
`;

export const LoginButton = styled(AddBtnSubmit)`
  align-self: stretch;
  height: 5rem;
  border-radius: 7px;
  background-color: ${colorPrimary};
  display: grid;
  place-items: center;
  box-shadow: 0 0.2rem 0.2rem rgba(var(--color-black) / 0.15);
  cursor: pointer;
  transition: transform 0ms, background-color 0.3s ease-in-out, color 0.3s ease-in-out;
  margin-bottom: 1rem;

  &:hover {
    background-color: ${({ theme }) => theme.primary};
    color: ${colorPrimary};
  }
  &:active {
    transform: translateY(1px);
    box-shadow: none;
  }
`;

export const LoginForm = styled.form`
  background-color: ${({ theme }) => theme.primary};
  border-radius: 7px;
  width: 80%;
  box-shadow: 0 0.2rem 0.2rem rgba(var(--color-black) / 0.15);
  display: grid;
  place-items: center;
  margin: 0 auto;
  gap: 1rem;
`;

export const LoginFormButton = styled(AddBtnSubmit)`
  align-self: center;
  width: 80%;
  display: grid;
  place-items: center;
  background-color: ${colorPrimary};
  transition: all 0.4s ease-in-out;
  cursor: pointer;

  &:hover {
    background-color: ${colorPrimaryDark};
  }
  &:disabled {
    background-color: ${colorGrayDark1};
  }
  &:active {
    transition: background-color 0s;
    background-color: ${colorPrimaryLight};
  }
`;

export const LoginInput = styled.input`
  width: 80%;
  border: 1px solid ${colorGrayDark1};
  border-radius: 3px;
  padding: 0.5rem 1rem;
  transition: all 0.4s ease-in-out;

  &:first-child {
    margin-bottom: -0.5rem;
    margin-top: 0.9rem;
  }
  &:focus {
    outline: none;
    box-shadow: 0 0.2rem 0.2rem ${boxShadow};
  }
  &::placeholder {
    font-size: 0.9rem;
  }
`;

export const Errors = styled.div`
  p {
    font-size: 0.8rem;
    color: ${colorDelete};
    text-align: center;
  }
`;

export const RegisterLink = styled(Link)`
  &:visited {
    text-decoration: none;
    color: ${colorGrayDark1};
    transition: 0.3s ease all;
    &:hover {
      color: ${colorPrimary};
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
