import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders hello and updateTextbox", () => {
  render(<App />);
  const helloText = screen.getByText(/Hello/i);
  expect(helloText).toBeInTheDocument();
});

test("renders with WI data", () => {
  React.useState = jest
    .fn()
    .mockReturnValueOnce([{ name: "Sumit" }, {}])
    .mockReturnValueOnce([false, {}])
    .mockReturnValueOnce([
      [
        {
          id: 1,
          title: "new item",
          children: [
            { id: 2, title: "new child item" },
            { id: 3, title: "new child item 2" },
            {
              id: 4,
              title: "new child item 4",
              children: [
                { id: 5, title: "new child item 5" },
                { id: 6, title: "new child item 6" },
              ],
            },
          ],
        },
      ],
      {},
    ])
    .mockReturnValueOnce([{ id: 3, title: "new child item 3" }]);
  const appTree = render(<App />);
  expect(appTree.container).toMatchSnapshot();
});
