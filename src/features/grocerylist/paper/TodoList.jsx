import React, { useEffect, useState } from "react";
import { useGetIngredients } from "../../services/grocerylistService";
import { StyledTodoList } from "./StyledPaper";
import { Todo } from "./Todo";
import { TodoComplete } from "./TodoComplete";

export const TodoList = ({ grocerylistId, mountPaper }) => {
  const { data, isLoading } = useGetIngredients(grocerylistId, mountPaper);

  // const [incomplete, setIncomplete] = useState(data.filter((d) => !d.isChecked));
  // const [complete, setComplete] = useState(data.filter((d) => d.isChecked));

  // console.log(complete);
  const [ingredients, setIngredients] = useState([]);
  const [mockData, setMockData] = useState([]);

  // const checked = data.reduce((checkedArray, ingredient, index) => {
  //   if (ingredient.isChecked) {
  //     const todo = (
  //       <Todo
  //         ingredient={ingredient}
  //         name="uncheck"
  //         key={`${ingredient.id}-${grocerylistId}-${index}`}
  //         grocerylistId={grocerylistId}
  //         todoClass="todo__label todo__label--checked"
  //       />
  //     );
  //     checkedArray.push(todo);
  //   }
  //   return checkedArray;
  // }, []);

  // const unChecked = data.reduce((uncheckedArray, ingredient, index) => {
  //   if (!ingredient.isChecked) {
  //     const todo = (
  //       <Todo
  //         ingredient={ingredient}
  //         name="check"
  //         key={`${ingredient.id}-${grocerylistId}-${index}`}
  //         grocerylistId={grocerylistId}
  //         todoClass="todo__label"
  //       />
  //     );
  //     uncheckedArray.push(todo);
  //   }
  //   return uncheckedArray;
  // }, []);

  useEffect(() => {
    if (data) {
      setMockData(data);
      const arrangedIngredients = data.reduce((checkedArray, ingredient, index) => {
        const todo = (
          <Todo
            ingredient={ingredient}
            key={`${ingredient.id}-${grocerylistId}-${index}`}
            grocerylistId={grocerylistId}
            position={index + 1}
            mockData={mockData}
            setMockData={setMockData}
          />
        );
        if (ingredient.isChecked) {
          // Consolidate to one todo to add index
          // Find out how to move an item to the end of an array
          // Replicate that on the DOM

          checkedArray.push(todo);
        } else {
          checkedArray.unshift(todo);
        }
        return checkedArray;
      }, []);
      setIngredients(arrangedIngredients);
    }
  }, [mockData, grocerylistId, data]);
  if (isLoading || !data) return <h1>Loading...</h1>;

  const checked = data.filter((d) => d.isChecked);
  const unchecked = data.filter((d) => !d.isChecked);
  return (
    <StyledTodoList>
      {/* <StyledTodoList className="todo-list" id={`todo-list-${grocerylistId}`}> */}
      {data.length === checked.length ? (
        <TodoComplete grocerylistId={grocerylistId} />
      ) : (
        <>
          {/* {complete.map((todo) => (
            <Todo
              key={todo.name + todo.id}
              ingredient={todo}
              grocerylistId={grocerylistId}
              setComplete={setComplete}
              setIncomplete={setIncomplete}
            />
          ))}
          {incomplete.map((todo) => (
            <Todo
              key={todo.name + todo.id}
              ingredient={todo}
              grocerylistId={grocerylistId}
              setComplete={setComplete}
              setIncomplete={setIncomplete}
            />
          ))} */}
          <h2>Incomplete</h2>
          {ingredients}
          <div className="todo-list__incomplete">{/* {unChecked} */}</div>
          {/* {checked.length > 0 && <div className="todo-list__incomplete">{checked}</div>} */}
        </>
      )}
    </StyledTodoList>
  );
};
