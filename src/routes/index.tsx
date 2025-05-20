import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useGroups } from "../hooks/useGroups";
import { generatePastelColor } from "../hooks/useExpenses";

export const Route = createFileRoute("/")({
  component: Homepage,
});

function Homepage() {
  const navigate = useNavigate();
  const { groups, createGroup, setActiveGroup } = useGroups();
  const [newGroupName, setNewGroupName] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <Stack
      height={"100%"}
      width={"100%"}
      maxWidth={"800px"}
      // alignItems={"center"}
      // justifyContent={"center"}
      spacing={3}
      // sx={{
      //   position: "absolute",
      //   top: "50%",
      //   left: "50%",
      //   transform: "translate(-50%, -50%)",
      // }}
    >
      <Typography variant="h4" align="center">
        💰 Harn Gun Na 💰
      </Typography>
      {/* <Typography variant="subtitle1" align="center">
        Easily track shared expenses and settle up with friends. Log who paid,
        split costs fairly, and see who owes what — all in one simple app.
      </Typography> */}
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
      <Stack width={1}>
        <Stack direction={"row"}>
          <TextField
            label="ค้นหากลุ่ม"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="outlined"
            color="warning"
            onClick={() => {
              setSearch("");
            }}
          >
            ล้างค่า
          </Button>
        </Stack>

        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setIsCreatingGroup(true);
          }}
          sx={{ width: "fit-content", alignSelf: "flex-end" }}
        >
          ➕ เพิ่มกลุ่ม
        </Button>
      </Stack>

      <Box
        display={"grid"}
        gridTemplateColumns={"repeat(2, 1fr)"}
        gap={2}
        width={"100%"}
      >
        {Object.values(groups)
          .filter((group) =>
            group.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((group) => (
            <Paper
              key={group.id}
              sx={{
                p: 2,
                cursor: "pointer",
                bgcolor: generatePastelColor(),
              }}
              onClick={() => {
                setActiveGroup(group.id);
                navigate({ to: "/harngunna", search: { groupId: group.id } });
              }}
            >
              <Typography variant="h6">{group.name}</Typography>
              <Typography variant="body2">{group.people.length} คน</Typography>
            </Paper>
          ))}
      </Box>
      <Dialog
        fullWidth
        open={isCreatingGroup}
        onClose={() => setIsCreatingGroup(false)}
      >
        <DialogTitle>สร้างกลุ่ม</DialogTitle>
        <DialogContent>
          <TextField
            label="ชื่อกลุ่ม"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            fullWidth
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setIsCreatingGroup(false)}
          >
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (newGroupName.trim()) {
                createGroup(newGroupName);
                setNewGroupName("");
                setIsCreatingGroup(false);
              }
            }}
          >
            เพิ่ม
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
