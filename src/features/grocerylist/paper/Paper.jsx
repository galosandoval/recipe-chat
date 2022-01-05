import React from "react";
import { xSVG } from "../../../styles/svgs";
import { enableBodyScroll } from "body-scroll-lock";
import { Content, PaperButton, PaperContainer, Pattern, StyledPaper } from "./StyledPaper";
import { TodoList } from "./TodoList";
import { removeBlur } from "../../utils/modalBlur";

const Paper = ({ grocerylistId, listIsVisible, closeBtn, setListIsVisible, paper, mountPaper }) => {
  const handleCloseList = () => {
    const windowWidth = window.screen.width;
    setListIsVisible(false);
    if (windowWidth <= 575) {
      enableBodyScroll(paper);
      removeBlur();
    }
  };

  return (
    <StyledPaper ref={paper} listIsVisible={listIsVisible}>
      <PaperContainer>
        <PaperButton ref={closeBtn} onClick={handleCloseList}>
          {xSVG}
        </PaperButton>
        <Pattern>
          <Content>
            <div>
              <TodoList grocerylistId={grocerylistId} mountPaper={mountPaper} />
            </div>
          </Content>
        </Pattern>
      </PaperContainer>
    </StyledPaper>
  );
};

export default Paper;
