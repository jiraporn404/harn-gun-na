import { Box, Button, Stack, Typography } from "@mui/material";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Homepage,
});

function Homepage() {
  const navigate = useNavigate();

  return (
    <Stack
      p={2}
      height={"100%"}
      width={"100%"}
      maxWidth={"800px"}
      alignItems={"center"}
      justifyContent={"center"}
      spacing={3}
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <Typography variant="h3" align="center">
        Harn Gun Na
      </Typography>
      <Typography variant="subtitle1" align="center">
        Easily track shared expenses and settle up with friends. Log who paid,
        split costs fairly, and see who owes what — all in one simple app.
      </Typography>
      <Stack direction={"row"} justifyContent={"center"} spacing={2}>
        <Box
          bgcolor={"primary.main"}
          width={20}
          height={20}
          borderRadius={"50%"}
        />
        <Box
          bgcolor={"primary.light"}
          width={20}
          height={20}
          borderRadius={"50%"}
        />
        <Box
          bgcolor={"secondary.main"}
          width={20}
          height={20}
          borderRadius={"50%"}
        />
        <Box
          bgcolor={"secondary.light"}
          width={20}
          height={20}
          borderRadius={"50%"}
        />
        <Box
          bgcolor={"success.main"}
          width={20}
          height={20}
          borderRadius={"50%"}
        />
        <Box
          bgcolor={"success.light"}
          width={20}
          height={20}
          borderRadius={"50%"}
        />
        <Box
          bgcolor={"error.main"}
          width={20}
          height={20}
          borderRadius={"50%"}
        />
        <Box
          bgcolor={"error.light"}
          width={20}
          height={20}
          borderRadius={"50%"}
        />
      </Stack>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate({ to: "/harngunna" })}
        sx={{ color: "white" }}
      >
        Let's get started
      </Button>
    </Stack>
  );
}
