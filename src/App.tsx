import { createRouter, RouterProvider } from "@tanstack/react-router";
import { ThemeProvider } from "@mui/material/styles";
import "./App.css";
import { routeTree } from "./routeTree.gen";
import { theme } from "./theme";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <>
        <RouterProvider router={router} />
      </>
    </ThemeProvider>
  );
}

export default App;
