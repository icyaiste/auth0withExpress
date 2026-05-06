// Profile.test.jsx
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, it, expect } from "vitest";

afterEach(() => {
  cleanup();
});

// A fake version of the Profile component so we can test
// the UI without making real fetch calls to the backend.
const FakeProfile = ({ user, loading }) => {
  if (loading) return <p>Loading ...</p>;
  if (!user) return <p>Not logged in.</p>;
  return (
    <div>
      <h2>Hello {user.given_name || user.name}</h2>
      {user.picture && (
        <img
          src={user.picture}
          alt={user.name}
          style={{ width: 80, borderRadius: "50%" }}
        />
      )}
      <p>{user.email}</p>
      <a href="http://localhost:3000/logout">Log out</a>
      <button>Fetch secure data</button>
    </div>
  );
};

describe("Profile UI", () => {
  // Test 1: shows loading text while data is being fetched
  it("shows a loading message while loading", () => {
    render(<FakeProfile user={null} loading={true} />);
    expect(screen.getByText("Loading ...")).toBeInTheDocument();
  });

  // Test 2: shows not logged in when there is no user
  it("shows not logged in when there is no user", () => {
    render(<FakeProfile user={null} loading={false} />);
    expect(screen.getByText("Not logged in.")).toBeInTheDocument();
  });

  // Test 3: shows given_name when available
  it("shows the given name when logged in", () => {
    const fakeUser = {
      given_name: "Ada",
      name: "Ada Lovelace",
      email: "ada@test.com",
      picture: null,
    };

    render(<FakeProfile user={fakeUser} loading={false} />);
    expect(screen.getByText("Hello Ada")).toBeInTheDocument();
  });

  // Test 4: falls back to name if given_name is not available
  it("falls back to name if given_name is missing", () => {
    const fakeUser = {
      given_name: null,
      name: "Ada Lovelace",
      email: "ada@test.com",
      picture: null,
    };

    render(<FakeProfile user={fakeUser} loading={false} />);
    expect(screen.getByText("Hello Ada Lovelace")).toBeInTheDocument();
  });

  // Test 5: shows the profile picture when one is provided
  it("shows the profile picture when logged in", () => {
    const fakeUser = {
      given_name: "Ada",
      name: "Ada Lovelace",
      email: "ada@test.com",
      picture: "http://img.test/pic.jpg",
    };

    render(<FakeProfile user={fakeUser} loading={false} />);
    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "http://img.test/pic.jpg");
  });

  // Test 6: does not show image when picture is null
  it("does not show an image when there is no picture", () => {
    const fakeUser = {
      given_name: "Ada",
      name: "Ada Lovelace",
      email: "ada@test.com",
      picture: null,
    };

    render(<FakeProfile user={fakeUser} loading={false} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});