import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useGroups } from "../hooks/useGroups";
import { AddOutlined, CloseOutlined } from "@mui/icons-material";

export const Route = createFileRoute("/")({
  component: Homepage,
});

function Homepage() {
  const navigate = useNavigate();
  const { groups, createGroup, setActiveGroup, deleteGroup } = useGroups();
  const [newGroupName, setNewGroupName] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [search, setSearch] = useState("");
  const [isSearch, setIsSearch] = useState(false);

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
      p={2}
    >
      <Typography variant="h4" align="center">
        💰 Harn Gun Na 💰
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
      <Stack width={1}>
        {isSearch && (
          <TextField
            label="ค้นหากลุ่ม"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{
              endAdornment: (
                <InputAdornment
                  position="end"
                  onClick={() => {
                    setSearch("");
                  }}
                >
                  <IconButton
                    size="small"
                    sx={{
                      opacity: search.length > 0 ? 1 : 0,
                      transition: "opacity 0.2s ease-in-out",
                    }}
                  >
                    <CloseOutlined fontSize="small" color="warning" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}

        <Stack direction={"row"} justifyContent={"space-between"}>
          <FormControlLabel
            control={
              <Switch
                checked={isSearch}
                onChange={() => setIsSearch(!isSearch)}
              />
            }
            label="ค้นหากลุ่ม"
          />{" "}
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setNewGroupName("");
              setIsCreatingGroup(true);
            }}
            sx={{ width: "fit-content", alignSelf: "flex-end", color: "white" }}
          >
            <AddOutlined fontSize="small" /> เพิ่มกลุ่ม
          </Button>
        </Stack>
      </Stack>

      <Box
        display={"grid"}
        gridTemplateColumns={"repeat(1, 1fr)"}
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
                py: 1,
                cursor: "pointer",
                bgcolor: group.color,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onClick={() => {
                setActiveGroup(group.id);
                navigate({ to: "/harngunna", search: { groupId: group.id } });
              }}
            >
              <Typography fontWeight={500}>{group.name}</Typography>
              <Box
                sx={{
                  cursor: "pointer",
                  color: "error.main",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteGroup(group.id);
                }}
              >
                ลบ
              </Box>
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
            autoComplete="off"
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                if (newGroupName.trim()) {
                  await createGroup(newGroupName);
                  setNewGroupName("");
                  setIsCreatingGroup(false);
                }
              }
            }}
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
            disabled={!newGroupName.trim()}
            onClick={async () => {
              if (newGroupName.trim()) {
                await createGroup(newGroupName);
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
