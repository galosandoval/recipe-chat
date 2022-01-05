import { NavLink } from "react-router-dom";
import styled from "styled-components/macro";
import { colorGrayDark1, colorPrimary, colorWhite } from "../../styles/GlobalVariables";
import { device } from "../../styles/mediaQueries";
import { AddBtnSubmit, xSVGButton } from "../../styles/shared";

export const StyledNavbar = styled.header`
  display: flex;
  align-items: center;
  max-width: 1200px;
  color: #000;
  position: relative;
  z-index: 1;
  margin: 0 auto;
`;

export const NavbarList = styled.ul`
  display: flex;
  align-items: center;
  flex: 0 0 90%;

  @media ${device.phone} {
    justify-content: space-between;
    flex: 0 0 100%;
    padding: 0 1rem;
  }
`;

export const Logo = styled.h1`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 0 0 10%;

  @media ${device.phone} {
    margin: auto;
    font-size: 2.5rem;
  }
`;

export const AddButton = styled(xSVGButton)`
  margin-left: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  border: none;
  color: ${colorPrimary};
  border-radius: 50%;
  padding: 0.2rem;

  &:hover {
    background-color: ${colorPrimary};
    color: ${colorWhite};
  }

  @media ${device.phone} {
    margin-left: 0;

    svg {
      height: 3rem;
      width: 3rem;
    }
  }
`;

export const Background = styled.div`
  height: 100%;
  inset: 0;
  aspect-ratio: 1;
  position: fixed;
  background: linear-gradient(to left bottom, $color-primary, $color-primary-dark);
  z-index: 1000;
  transition: transform 0.8s cubic-bezier(0.86, 0, 0.07, 1);
  transform: translateY(-105%);
`;

export const SidebarToggle = styled.button`
  ${Background} {
    transform: ${(p) => (p.sidebarVisible ? "translateY(0)" : "translateY(-105%)")};
  }

  @media ${device.phone} {
    height: 3.4rem;
    width: 3.4rem;
    display: grid;
    place-items: center;
    background-color: transparent;
    border: none;
    right: 2rem;
    color: ${colorPrimary};
  }
`;

/**
 * NavLinks
 */

export const StyledNavlink = styled(NavLink)``;

export const ListItem = styled.li`
  list-style: none;
  margin-left: 1rem;
  a,
  a:visited {
    color: ${({ theme }) => theme.font};
    text-decoration: none;
    transition: all 0.3s ease;
    padding: 0.5rem 1rem;

    &:hover {
      color: ${colorPrimary};
    }
  }
  .active,
  .active:visited {
    background-color: ${colorPrimary};
    color: ${({ theme }) => theme.background};
    border-radius: 5px;
    &:hover {
      color: ${({ theme }) => theme.background};
    }
  }
`;

export const LogoutButton = styled(AddBtnSubmit)`
  margin-bottom: 0;
  padding: 0.5rem 1rem;

  &:hover {
    background-color: ${colorGrayDark1};
  }
`;

/**
 * FormContainer
 */

export const FormContainer = styled.div``;

export const CloseButton = styled(xSVGButton)``;

export const Title = styled.h1``;

export const Description = styled.p``;
