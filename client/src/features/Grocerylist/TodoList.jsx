import axios from "axios";
import React, { useEffect, useState } from "react";
import { useGetIngredients } from "../services/grocerylist";
import { Loading } from "../status/Loading";
import { Todo } from "./Todo";
import { TodoComplete } from "./TodoComplete";

export const TodoList = ({ grocerylistId }) => {
  const { data: ingredients, isIdle, isLoading, isSuccess } = useGetIngredients(grocerylistId);

  console.log({ ingredients, isIdle });

  const [todoList, setTodoList] = useState(() =>
    JSON.parse(localStorage.getItem(`gl-${grocerylistId}`) || ingredients)
  );

  // const unchecked =
  //   isIdle || isSuccess ? JSON.parse(localStorage.getItem(`gl-${grocerylistId}`)) : null;
  // console.log({ unchecked });

  console.log({ todoList });

  const complete =
    todoList !== null &&
    todoList
      .filter((incomplete) => incomplete.isComplete)
      .map((ingredient) => (
        <Todo
          ingredient={ingredient}
          todoList={todoList}
          setTodoList={setTodoList}
          name="uncheck"
          key={ingredient.id}
          grocerylistId={grocerylistId}
          todoClass="todo__label todo__label--checked"
        />
      ));

  const incomplete =
    todoList !== null &&
    todoList
      .filter((incomplete) => !incomplete.isComplete)
      .map((ingredient) => (
        <Todo
          ingredient={ingredient}
          todoList={todoList}
          setTodoList={setTodoList}
          name="check"
          key={ingredient.id}
          grocerylistId={grocerylistId}
          todoClass="todo__label"
        />
      ));

  useEffect(() => {
    if (isSuccess) {
      const toLocalStorage = ingredients.map((i) => ({
        name: i.name,
        isComplete: 0,
        id: i.id,
        recipeId: i["recipe-id"]
      }));

      localStorage.setItem(`gl-${grocerylistId}`, JSON.stringify(toLocalStorage));
      
    }
    // if (localStorage.getItem(`gl-${grocerylistId}`) === null) {
    //   const getIngredients = (id) => {
    //     axios
    //       .get(`http://localhost:4000/recipes-grocery-lists/ingredients/${id}`)
    //       .then((ingredients) => {
    //         const incompleteArray = [];
    //         ingredients.data.ingredients.forEach((ingredient) => {
    //           const ingredientData = {
    //             name: ingredient.name,
    //             isComplete: 0,
    //             id: ingredient.id,
    //             recipeId: ingredient["recipe-id"]
    //           };
    //           incompleteArray.push(ingredientData);
    //         });
    //         setTodoList(incompleteArray);
    //         localStorage.setItem(`gl-${grocerylistId}`, JSON.stringify(incompleteArray));
    //       })
    //       .catch((error) => console.log(error));
    //   };
    //   getIngredients(grocerylistId);
    // }
  }, [grocerylistId, isLoading, ingredients, isSuccess]);
  return (
    <div className="todo-list">
      {isLoading ? (
        <Loading />
      ) : todoList.filter((todo) => todo.isComplete).length === todoList.length ? (
        <TodoComplete setTodoList={setTodoList} grocerylistId={grocerylistId} />
      ) : (
        <>
          <div className="todo-list__incomplete">
            <h2>Incomplete</h2>
            {incomplete}
          </div>
          {todoList !== null && todoList.filter((todo) => todo.isComplete).length > 0 && (
            <div className="todo-list__incomplete">
              <h2>Completed</h2>
              {complete}
            </div>
          )}
        </>
      )}
    </div>
  );
};
