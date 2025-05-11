import { createFileRoute } from "@tanstack/react-router";
import {
  Stack,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  useMediaQuery,
  FormControlLabel,
  Checkbox,
  Snackbar,
  SnackbarCloseReason,
  AlertTitle,
  Alert,
  Tooltip,
  Switch,
  Divider,
} from "@mui/material";
import { Expense, useExpenses } from "../hooks/useExpenses";
import { useState, useRef } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import html2canvas from "html2canvas";
import { DeleteDialog } from "../dialog/deleteDialog";

export const Route = createFileRoute("/harngunna")({
  component: RouteComponent,
});

interface PaymentInput {
  payerId: string;
  amount: string;
}

function RouteComponent() {
  const {
    expenses,
    people,
    addExpense,
    addPerson,
    totalExpenses,
    calculateSharedExpenses,
    calculateTransactions,
    deletePerson,
    deleteExpense,
    editExpense,
    clearPeopleData,
    clearExpensesData,
  } = useExpenses();
  const balanceCardsRef = useRef<HTMLDivElement>(null);
  const transactionsRef = useRef<HTMLDivElement>(null);
  const expensesRef = useRef<HTMLDivElement>(null);
  const editPaperRef = useRef<HTMLDivElement>(null);
  const isSmallScreen = useMediaQuery("(max-width: 600px)");
  const [expenseName, setExpenseName] = useState("");
  const [newPersonName, setNewPersonName] = useState("");
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [payments, setPayments] = useState<PaymentInput[]>([
    { payerId: "", amount: "" },
  ]);
  const [isSharedAll, setIsSharedAll] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDialogType, setDeleteDialogType] = useState<
    "person" | "expense" | "people" | "expenses" | null
  >(null);
  const [deletePersonId, setDeletePersonId] = useState<string | null>(null);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [saveSnackbarOpen, setSaveSnackbarOpen] = useState(false);
  const [deleteSnackbarOpen, setDeleteSnackbarOpen] = useState(false);
  const [isAddPayer, setIsAddPayer] = useState(false);
  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName) return;
    addPerson(newPersonName);
    setNewPersonName("");
  };

  const handleAddPayment = () => {
    setPayments([...payments, { payerId: "", amount: "" }]);
  };

  const handleRemovePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const handlePaymentChange = (
    index: number,
    field: keyof PaymentInput,
    value: string
  ) => {
    const newPayments = [...payments];
    newPayments[index] = { ...newPayments[index], [field]: value };
    setPayments(newPayments);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseName || payments.length === 0 || sharedWith.length === 0)
      return;

    if (payments.some((p) => !p.payerId || !p.amount)) return;

    const totalAmount = payments.reduce(
      (sum, p) => sum + parseFloat(p.amount),
      0
    );

    const expenseData = {
      name: expenseName,
      totalAmount,
      date: new Date().toISOString(),
      payments: payments.map((p) => ({
        payerId: p.payerId,
        amount: parseFloat(p.amount),
      })),
      sharedWith,
    };

    if (editingExpenseId) {
      editExpense(editingExpenseId, expenseData);
      setEditingExpenseId(null);
    } else {
      addExpense(expenseData);
    }

    setExpenseName("");
    setPayments([{ payerId: "", amount: "" }]);
    setSharedWith([]);
    setIsSharedAll(false);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setExpenseName(expense.name);
    setPayments(
      expense.payments.map((p) => ({
        payerId: p.payerId,
        amount: p.amount.toString(),
      }))
    );
    setSharedWith(expense.sharedWith);
    setIsSharedAll(expense.sharedWith.length === people.length);

    setTimeout(() => {
      editPaperRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleCancelEdit = () => {
    setEditingExpenseId(null);
    setExpenseName("");
    setPayments([{ payerId: "", amount: "" }]);
    setSharedWith([]);
    setIsSharedAll(false);
  };

  const balances = calculateSharedExpenses();
  const transactions = calculateTransactions();

  const handleSharedAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSharedAll(e.target.checked);
    if (e.target.checked) {
      setSharedWith(people.map((p) => p.id));
    } else {
      setSharedWith([]);
    }
  };

  const handleDelete = () => {
    if (deleteDialogType === "people") {
      clearPeopleData();
    } else if (deleteDialogType === "expenses") {
      clearExpensesData();
    } else if (deleteDialogType === "person") {
      deletePerson(deletePersonId as string);
    } else if (deleteDialogType === "expense") {
      deleteExpense(deleteExpenseId as string);
    }
    setDeleteDialogOpen(false);
  };

  const handleCloseSnackbar = (
    _event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setDeleteSnackbarOpen(false);
  };

  const handleSaveBalanceImage = async () => {
    if (!balanceCardsRef.current) return;

    try {
      const canvas = await html2canvas(balanceCardsRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "harn-gun-na-balances.png";
      link.href = image;
      link.click();

      setSaveSnackbarOpen(true);
    } catch (error) {
      console.error("Error saving image:", error);
    }
  };

  const handleSaveTransactionImage = async () => {
    if (!transactionsRef.current) return;

    try {
      const canvas = await html2canvas(transactionsRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "harn-gun-na-transactions.png";
      link.href = image;
      link.click();

      setSaveSnackbarOpen(true);
    } catch (error) {
      console.error("Error saving image:", error);
    }
  };

  const handleSaveExpenseImage = async () => {
    if (!expensesRef.current) return;

    try {
      const canvas = await html2canvas(expensesRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "harn-gun-na-expenses.png";
      link.href = image;
      link.click();

      setSaveSnackbarOpen(true);
    } catch (error) {
      console.error("Error saving image:", error);
    }
  };

  const handleCloseSaveSnackbar = (
    _event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSaveSnackbarOpen(false);
  };

  return (
    <Stack
      spacing={2}
      sx={{
        py: 2,
        minWidth: { xs: "100%", sm: "60vw", md: "60vw" },
      }}
    >
      <Typography
        component={"span"}
        align="center"
        fontSize={24}
        fontWeight={600}
      >
        💰 Harn Gun Na 💰
      </Typography>
      <Paper sx={{ p: 2 }}>
        <form onSubmit={handleAddPerson}>
          <Stack
            display={isAddPayer ? "flex" : "none"}
            direction={isSmallScreen ? "column" : "row"}
          >
            <TextField
              label="เพิ่มคน"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{
                color: "white",
              }}
            >
              เพิ่ม
            </Button>
          </Stack>
          <FormControlLabel
            control={
              <Switch
                checked={isAddPayer}
                onChange={() => setIsAddPayer(!isAddPayer)}
              />
            }
            label="เพิ่มคนที่ชำระเงิน"
          />
          <Stack
            direction="row"
            spacing={1}
            sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}
          >
            {people.map((person) => (
              <Chip
                key={person.id}
                label={person.name}
                sx={{
                  backgroundColor: person.color,
                  "&:hover": {
                    backgroundColor: person.color,
                    opacity: 0.8,
                  },
                }}
                onDelete={() => {
                  if (
                    expenses.some((expense) =>
                      expense.payments.some(
                        (payment) => payment.payerId === person.id
                      )
                    ) ||
                    expenses.some((expense) =>
                      expense.sharedWith.includes(person.id)
                    )
                  ) {
                    setDeleteSnackbarOpen(true);
                  } else {
                    setDeletePersonId(person.id);
                    setDeleteDialogType("person");
                    deletePerson(person.id);
                  }
                }}
              />
            ))}
          </Stack>
        </form>
      </Paper>
      <Paper ref={editPaperRef} sx={{ p: 2 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography component={"span"} variant="h6">
                {editingExpenseId ? "แก้ไขรายการ" : "เพิ่มรายการ"}
              </Typography>
            </Stack>
            <TextField
              label="รายการ"
              value={expenseName}
              onChange={(e) => setExpenseName(e.target.value)}
              fullWidth
              required
            />

            <Typography component={"span"} variant="subtitle1">
              ชำระเงิน {payments.length > 0 ? `(${payments.length} คน)` : ""}
            </Typography>
            {payments.map((payment, index) => (
              <Stack
                key={index}
                // direction={isSmallScreen ? "column" : "row"}
                alignItems="center"
                width={1}
              >
                <FormControl sx={{ flex: 1 }} required fullWidth>
                  <InputLabel size="small" shrink>
                    ชำระโดย
                  </InputLabel>
                  <Select
                    value={payment.payerId}
                    onChange={(e) =>
                      handlePaymentChange(index, "payerId", e.target.value)
                    }
                    label="ชำระโดย"
                    disabled={people.length === 0}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 300,
                        },
                      },
                    }}
                    notched
                  >
                    {people.map((person) => (
                      <MenuItem key={person.id} value={person.id}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              backgroundColor: person.color,
                            }}
                          />
                          {person.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Stack
                  direction={"row"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                  width={1}
                >
                  <TextField
                    label="จำนวน"
                    type="number"
                    value={payment.amount}
                    onChange={(e) =>
                      handlePaymentChange(index, "amount", e.target.value)
                    }
                    required
                    // sx={{ width: isSmallScreen ? "100%" : "150px" }}
                    disabled={people.length === 0 || payment.payerId === ""}
                    fullWidth
                  />
                  {payments.length > 1 && (
                    <IconButton
                      onClick={() => handleRemovePayment(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Stack>
                {index < payments.length - 1 && <Divider sx={{ width: 1 }} />}
              </Stack>
            ))}
            <Button
              type="button"
              variant="outlined"
              onClick={handleAddPayment}
              sx={{ alignSelf: "flex-start" }}
              color="success"
              startIcon={"💰"}
            >
              เพิ่มชำระเงิน
            </Button>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isSharedAll}
                  onChange={handleSharedAllChange}
                />
              }
              label="แบ่งกับทุกคน"
            />
            <FormControl fullWidth required>
              <InputLabel size="small" shrink>
                แบ่งกับ
              </InputLabel>
              <Select
                multiple
                value={sharedWith}
                onChange={(e) => {
                  if (e.target.value.length === people.length) {
                    setIsSharedAll(true);
                  } else {
                    setIsSharedAll(false);
                  }
                  setSharedWith(e.target.value as string[]);
                }}
                label="แบ่งกับ"
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => {
                      const person = people.find((p) => p.id === value);
                      return (
                        <Chip
                          key={value}
                          label={person?.name}
                          sx={{
                            backgroundColor: person?.color,
                            "&:hover": {
                              backgroundColor: person?.color,
                              opacity: 0.8,
                            },
                          }}
                        />
                      );
                    })}
                  </Box>
                )}
                disabled={people.length === 0}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 300,
                    },
                  },
                }}
                notched
              >
                {people.map((person) => (
                  <MenuItem key={person.id} value={person.id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          backgroundColor: person.color,
                        }}
                      />
                      {person.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Stack direction={"row"} width={1}>
              {editingExpenseId && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleCancelEdit}
                  fullWidth
                >
                  ยกเลิก
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                color={editingExpenseId ? "secondary" : "primary"}
                sx={{
                  color: "white",
                }}
                fullWidth
              >
                {editingExpenseId ? "บันทึกการแก้ไข" : "เพิ่มรายการ"}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
      {/* Total Expense */}
      <Paper ref={expensesRef} sx={{ p: 2 }}>
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Typography
            component={"span"}
            fontSize={18}
            fontWeight={500}
            gutterBottom
            sx={{ flex: 1 }}
          >
            ค่าใช้จ่ายรวม
          </Typography>
          <Typography
            component={"span"}
            variant="h6"
            sx={{
              color: "error.main",
              fontSize: 24,
              fontWeight: 600,
              bgcolor: "grey.200",
              p: 0.5,
              borderRadius: 1,
            }}
          >
            {totalExpenses.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Typography>{" "}
          <Tooltip title="บันทึกเป็นรูปภาพ">
            <IconButton
              onClick={handleSaveExpenseImage}
              color="inherit"
              sx={{
                opacity: 0.7,
                "&:hover": {
                  opacity: 1,
                },
              }}
              data-html2canvas-ignore="true"
            >
              <SaveAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
        <List>
          {expenses.map((expense) => (
            <ListItem
              key={expense.id}
              sx={{
                border: expense.id === editingExpenseId ? 2 : 1,
                borderStyle: "dashed",
                borderColor:
                  expense.id === editingExpenseId
                    ? "secondary.main"
                    : "divider",
                borderRadius: 2,
                mb: 1,
              }}
            >
              <Box sx={{ width: "100%" }}>
                <Stack direction={"row"} justifyContent={"space-between"}>
                  <Stack direction={"row"}>
                    <Typography component={"span"}>{expense.name}</Typography>
                    <Chip
                      label={`฿ ${expense.totalAmount.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}`}
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    {expense.id !== editingExpenseId && (
                      <IconButton
                        onClick={() => handleEditExpense(expense)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton
                      onClick={() => {
                        setDeleteExpenseId(expense.id);
                        setDeleteDialogType("expense");
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </Stack>
                </Stack>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <Stack direction={"row"} spacing={1}>
                    <Typography
                      component={"span"}
                      fontSize={14}
                      color="text.secondary"
                    >
                      ชำระโดย:
                    </Typography>
                    {expense.payments.map((payment) => {
                      const payer = people.find(
                        (p) => p.id === payment.payerId
                      );
                      return (
                        <Chip
                          key={payment.payerId}
                          label={`${payer?.name} ฿ ${payment.amount.toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}`}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: payer?.color,
                            borderWidth: 2,
                          }}
                        />
                      );
                    })}
                  </Stack>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      component={"span"}
                      fontSize={14}
                      color="text.secondary"
                    >
                      แบ่งกับ:
                    </Typography>
                    {expense.sharedWith.map((id) => {
                      const person = people.find((p) => p.id === id);
                      return (
                        <Chip
                          key={id}
                          label={person?.name}
                          size="small"
                          sx={{
                            backgroundColor: person?.color,
                            "&:hover": {
                              backgroundColor: person?.color,
                              opacity: 0.8,
                            },
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>
      {/* Who Owes Whom */}
      <Paper ref={transactionsRef} sx={{ p: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography component={"span"} fontSize={18} fontWeight={500}>
            สรุปการชำระเงิน
          </Typography>
          <Tooltip title="บันทึกเป็นรูปภาพ">
            <IconButton
              onClick={handleSaveTransactionImage}
              color="inherit"
              sx={{
                opacity: 0.7,
                "&:hover": {
                  opacity: 1,
                },
              }}
              data-html2canvas-ignore="true"
            >
              <SaveAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
        <List>
          {transactions.map((transaction, index) => {
            const fromPerson = people.find((p) => p.id === transaction.from);
            const toPerson = people.find((p) => p.id === transaction.to);
            return (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  mb: 1,
                  width: "100%",
                }}
              >
                <Stack direction={"row"} alignItems={"center"}>
                  <Chip
                    label={` ฿ ${transaction.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}
                    color="error"
                  />
                  <Chip
                    label={`${fromPerson?.name}`}
                    sx={{
                      bgcolor: fromPerson?.color,
                      fontSize: 16,
                    }}
                  />
                  <Typography component={"span"} fontSize={14}>
                    ต้องจ่ายให้
                  </Typography>
                  <Chip
                    label={`${toPerson?.name}`}
                    sx={{
                      bgcolor: toPerson?.color,
                      fontSize: 16,
                    }}
                  />
                </Stack>
              </Box>
            );
          })}
        </List>
      </Paper>
      {/* Balances */}
      <Paper ref={balanceCardsRef} sx={{ p: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography component={"span"} fontSize={18} fontWeight={500}>
            เงินคงค้าง
          </Typography>
          <Tooltip title="บันทึกเป็นรูปภาพ">
            <IconButton
              onClick={handleSaveBalanceImage}
              color="inherit"
              sx={{
                opacity: 0.7,
                "&:hover": {
                  opacity: 1,
                },
              }}
              data-html2canvas-ignore="true"
            >
              <SaveAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
        <Box display={"grid"} gridTemplateColumns={"repeat(3, 1fr)"} gap={1}>
          {people.map((person) => (
            <Box
              key={person.id}
              sx={{
                border: 2,
                borderColor: person.color,
                borderRadius: 2,
                p: 0.5,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography component={"span"}>{person.name}</Typography>
              <Typography
                component={"span"}
                fontSize={16}
                fontWeight={500}
                color={
                  balances[person.id] === 0
                    ? "inherit"
                    : balances[person.id] > 0
                      ? "success"
                      : "error"
                }
              >
                ฿{" "}
                {balances[person.id].toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
      {/* Clear data */}
      <Stack direction={"row"} justifyContent={"flex-end"}>
        <Button
          variant="outlined"
          color="error"
          onClick={() => {
            if (expenses.length > 0) {
              setDeleteSnackbarOpen(true);
            } else {
              setDeleteDialogType("people");
              setDeleteDialogOpen(true);
            }
          }}
          sx={{ width: "fit-content" }}
        >
          <DeleteIcon fontSize="small" /> ล้างข้อมูลคน
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={() => {
            setDeleteDialogType("expenses");
            setDeleteDialogOpen(true);
          }}
          sx={{ width: "fit-content" }}
        >
          <DeleteIcon fontSize="small" /> ล้างข้อมูลรายการ
        </Button>
      </Stack>
      {deleteDialogOpen && (
        <DeleteDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onDelete={handleDelete}
        />
      )}
      {deleteSnackbarOpen && (
        <Snackbar
          open={deleteSnackbarOpen}
          autoHideDuration={5000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity="error" onClose={handleCloseSnackbar}>
            <AlertTitle>มีรายการชำระเงิน กรุณาลบรายการชำระเงินก่อน</AlertTitle>
          </Alert>
        </Snackbar>
      )}
      {saveSnackbarOpen && (
        <Snackbar
          open={saveSnackbarOpen}
          autoHideDuration={2000}
          onClose={handleCloseSaveSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity="success" onClose={handleCloseSaveSnackbar}>
            บันทึกรูปภาพแล้ว
          </Alert>
        </Snackbar>
      )}
    </Stack>
  );
}
