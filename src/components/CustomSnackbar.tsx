import { Snackbar, Alert } from "@mui/material";

type SnackbarProps = {
  open: boolean;
  message: string;
  severity?: "success" | "error" | "warning" | "info";
  onClose: () => void;
  autoHideDuration?: number;
  anchorOrigin?: {
    vertical: "top" | "bottom";
    horizontal: "left" | "center" | "right";
  };
};

export function CustomSnackbar({
  open,
  message,
  severity = "info",
  onClose,
  autoHideDuration = 2000,
  anchorOrigin = { vertical: "top", horizontal: "center" },
}: SnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
    >
      <Alert severity={severity} onClose={onClose}>
        {message}
      </Alert>
    </Snackbar>
  );
}
