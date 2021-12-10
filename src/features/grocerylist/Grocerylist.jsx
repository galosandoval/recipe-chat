import React from "react";
import { useGrocerylist } from "../services/grocerylistService";
import { GrocerylistCard } from "./GrocerylistCard";
import { LoadingCards } from "../status/Loading.Cards";
import { useAuth } from "../utils/auth-config";

export const Grocerylist = () => {
  const { user } = useAuth();
  const { data: grocerylists, isLoading, isError, error, isSuccess } = useGrocerylist(user.id);

  if (isError) return <h1>{error}</h1>;
  return (
    <div className="grocerylist">
      <div className="grocerylist__card-container">
        {isLoading ? (
          <LoadingCards />
        ) : (
          isSuccess &&
          grocerylists.map((list, index) => (
            <GrocerylistCard index={index} list={list} key={list["grocery-list-id"]} />
          ))
        )}
      </div>
    </div>
  );
};
