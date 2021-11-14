import React from "react";

export const isEnter = (event: React.KeyboardEvent) =>
  event.key === "Enter" || event.keyCode === 13;

export const isEsc = (event: React.KeyboardEvent) =>
  event.key === "Esc" || event.keyCode === 27;
