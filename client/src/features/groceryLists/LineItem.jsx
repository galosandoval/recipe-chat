import React from 'react'

export const LineItem = ({ingredient}) => {
  return (
    <div className="line-item">
      <p>{ingredient}</p>
      <input type="checkbox" />
    </div>
  );
}
