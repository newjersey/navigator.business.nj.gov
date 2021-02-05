import { render } from "@testing-library/react";
import Home from "../../pages";

describe("HomePage", () => {
  it("should render the posts", () => {
    const posts = [
      {
        date: "2015-02-02T00:00:00.000Z",
        title: "my cool post",
        id: "123",
      },
      {
        date: "2016-02-02T00:00:00.000Z",
        title: "my other post",
        id: "456",
      },
    ];
    const subject = render(<Home allPosts={posts} />);

    expect(subject.getByText("my cool post")).toBeInTheDocument();
    expect(subject.getByText("my other post")).toBeInTheDocument();
  });
});
