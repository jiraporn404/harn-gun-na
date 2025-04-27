import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export function DeleteDialog({ open, onClose, onDelete }: DeleteDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>ลบข้อมูล</DialogTitle>
      <DialogContent>
        <DialogContentText>
          คุณแน่ใจหรือว่าต้องการลบข้อมูลนี้? ข้อมูลที่ลบไปจะไม่สามารถกู้คืนได้
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={onClose} sx={{ minWidth: "100px" }}>
          ยกเลิก
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onDelete}
          sx={{ minWidth: "100px" }}
        >
          ลบ
        </Button>
      </DialogActions>
    </Dialog>
  );
}
