import { Box } from "@mui/material";
import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        minWidth: "100vw",
      }}
    >
      <Box sx={{ p: 2, width: "-webkit-fill-available" }}>
        <Outlet />
      </Box>
    </Box>
  ),
});
