import { Container, Typography } from "@mui/material";
import { Link, Outlet, Route, Routes } from "react-router-dom";
import Bar from "./scenes/Bar/Bar.scene";

const App = () => {
  return (
    <Container maxWidth="lg">
      {/* Routes nest inside one another. Nested route paths build upon
            parent route paths, and nested route elements render inside
            parent route elements. See the note about <Outlet> below. */}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* Using path="*"" means "match anything", so this route
                acts like a catch-all for URLs that we don't have explicit
                routes for. */}
          <Route path="*" element={<NoMatch />} />
        </Route>
      </Routes>
    </Container>
  );
};

export default App;

function Layout() {
  return (
    <div>
      <Bar />

      {/* An <Outlet> renders whatever child route is currently active,
          so you can think about this <Outlet> as a placeholder for
          the child routes we defined above. */}
      <Outlet />
    </div>
  );
}

function Home() {
  return (
    <div>
      <Typography variant="h2">Home</Typography>
    </div>
  );
}

function About() {
  return (
    <div>
      <Typography variant="h2">About</Typography>
    </div>
  );
}

function Dashboard() {
  return (
    <div>
      <Typography variant="h2">Dashboard</Typography>
    </div>
  );
}

function NoMatch() {
  return (
    <div>
      <Typography variant="h2">Nothing to see here!</Typography>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
  );
}
