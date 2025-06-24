import { Box, Stack, Typography } from "@mui/material";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { version } from "../../package.json";
export const Route = createRootRoute({
  component: () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: "100vh",
        minWidth: "100vw",
        position: "relative",
      }}
    >
      <Box
        sx={{
          width: "-webkit-fill-available",
          flex: 1,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Outlet />
      </Box>
      <Stack
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          backgroundColor: "background.paper",
        }}
      >
        <Typography fontSize={10} align="center" color="text.secondary">
          Copyright 2025 Harn Gun Na. All rights reserved. | v{version} |
          Developed by{" "}
          <a href="https://github.com/jiraporn404" target="_blank">
            jiraporn404
          </a>
        </Typography>
      </Stack>
    </Box>
  ),
});
