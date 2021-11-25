# reminder-joes-app

## My goal for this project was to simulate a profesisonal work environment

- I worked with tasks on a kanban board:

  ![](readme-images/TJ%20Trello.png)

- I wrote a descriptive commit with every feature I completed:

  ![](readme-images/TJ%20Commit%20History.png)

## How to navigate this project

- The main feature of this app parses a recipe from a website and adds it to the users list of recipes: https://github.com/galosandoval/reminder-joes-app/blob/main/client/src/features/recipe/AddRecipe.jsx#L13
- Responsive CSS using SCSS and BEM. Here's a link to the sass folder: https://github.com/galosandoval/reminder-joes-app/tree/main/client/src/sass

## Why I built the project this way

- I didn't use a state management library like Redux on purpose. For this app simple `useState` is
  sufficient.
- I used SCSS for this project because the transpiler picks up bugs in CSS and nesting allows for faster styling.
- My plan become a fullstack developer but first I'd like to focus on the frontend so there is quite a bit more work done on the client for this project.
- Lately, I've been learning react-query and have been changing the way I make http requests. Heres an example:
### Look at how much code I've replaced! 
![](readme-images/react-query-example.png)

