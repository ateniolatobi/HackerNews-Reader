import React from "react";
import { render } from "@testing-library/react";
import Enzyme, { shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import ReactDOM from "react-dom";
import renderer from "react-test-renderer";
import App, { Search, Button, BookList } from "./App";
import { exportAllDeclaration } from "@babel/types";

Enzyme.configure({ adapter: new Adapter() });
describe("App", () => {
  it("Renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  test("has a valid snapshot", () => {
    const component = renderer.create(<App />);
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe("Search", () => {
  it("Renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<Search>Search</Search>, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  test("has a valid snapshot", () => {
    const component = renderer.create(<Search>Type to Search</Search>);
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe("Button", () => {
  it("Renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<Button>Give me more</Button>, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  test("has a valid snapshot", () => {
    const component = renderer.create(<Button>Give me more</Button>);
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe("BookList", () => {
  const props = {
    list: [
      { title: "1", author: "1", num_comments: 1, points: 2, objectID: "y" },
      { title: "2", author: "2", num_comments: 1, points: 2, objectID: "z" }
    ]
  };
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<BookList {...props} />, div);
  });
  test("has a valid snapshot", () => {
    const component = renderer.create(<BookList {...props} />);
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("shows two elements in list", () => {
    const element = shallow(<BookList {...props} />);
    expect(element.find(".table-row").length).toBe(2);
  });
});
