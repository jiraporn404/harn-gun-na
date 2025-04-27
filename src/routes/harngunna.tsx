import { createFileRoute } from "@tanstack/react-router";
import {
  Stack,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
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
} from "@mui/material";
import { useExpenses } from "../hooks/useExpenses";
import { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
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
    clearPeopleData,
    clearExpensesData,
  } = useExpenses();
  const [expenseName, setExpenseName] = useState("");
  const [newPersonName, setNewPersonName] = useState("");
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [payments, setPayments] = useState<PaymentInput[]>([
    { payerId: "", amount: "" },
  ]);
  const isSmallScreen = useMediaQuery("(max-width: 600px)");
  const [isSharedAll, setIsSharedAll] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDialogType, setDeleteDialogType] = useState<
    "person" | "expense" | "people" | "expenses" | null
  >(null);
  const [deletePersonId, setDeletePersonId] = useState<string | null>(null);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [deleteSnackbarOpen, setDeleteSnackbarOpen] = useState(false);

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

    addExpense({
      name: expenseName,
      totalAmount,
      date: new Date().toISOString(),
      payments: payments.map((p) => ({
        payerId: p.payerId,
        amount: parseFloat(p.amount),
      })),
      sharedWith,
    });

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

  return (
    <Stack
      spacing={2}
      sx={{
        py: 2,
        minWidth: { xs: "100%", sm: "60vw", md: "60vw" },
      }}
    >
      <Typography align="center" fontSize={24} fontWeight={600}>
        Harn Gun Na
      </Typography>
      <Paper sx={{ p: 2 }}>
        <form onSubmit={handleAddPerson}>
          <Stack direction={isSmallScreen ? "column" : "row"}>
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
      <Paper sx={{ p: 2 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="รายการ"
              value={expenseName}
              onChange={(e) => setExpenseName(e.target.value)}
              fullWidth
              required
            />

            <Typography variant="subtitle1">ชำระเงิน</Typography>
            {payments.map((payment, index) => (
              <Stack
                key={index}
                direction={isSmallScreen ? "column" : "row"}
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
                <TextField
                  label="จำนวน"
                  type="number"
                  value={payment.amount}
                  onChange={(e) =>
                    handlePaymentChange(index, "amount", e.target.value)
                  }
                  required
                  sx={{ width: isSmallScreen ? "100%" : "150px" }}
                  disabled={people.length === 0 || payment.payerId === ""}
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
            ))}
            <Button
              type="button"
              variant="outlined"
              onClick={handleAddPayment}
              sx={{ alignSelf: "flex-start" }}
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
            <Button type="submit" variant="contained" color="primary">
              เพิ่มรายการ
            </Button>
          </Stack>
        </form>
      </Paper>
      {/* Total Expense */}
      <Paper sx={{ p: 2 }}>
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Typography
            fontSize={18}
            fontWeight={500}
            gutterBottom
            sx={{ flex: 1 }}
          >
            ค่าใช้จ่ายรวม
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "error.main",
              fontSize: 24,
              fontWeight: 600,
              bgcolor: "primary.light",
              p: 0.5,
              borderRadius: 1,
            }}
          >
            💰 {totalExpenses.toFixed(2)}
          </Typography>
        </Stack>
        <List>
          {expenses.map((expense) => (
            <ListItem
              key={expense.id}
              secondaryAction={
                <IconButton
                  onClick={() => {
                    setDeleteExpenseId(expense.id);
                    setDeleteDialogType("expense");
                    setDeleteDialogOpen(true);
                  }}
                >
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              }
            >
              <Box sx={{ width: "100%" }}>
                <Stack direction={"row"}>
                  <Typography>{expense.name}</Typography>
                  <Chip
                    label={`฿ ${expense.totalAmount.toFixed(2)}`}
                    size="small"
                    sx={{
                      bgcolor: "secondary.light",
                      color: "error.main",
                    }}
                  />
                </Stack>
                <ListItemText
                  // primary={expense.name}
                  secondary={
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      {/* <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        ราคารวม: ฿ {expense.totalAmount.toFixed(2)}
                      </Box> */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                        }}
                      >
                        {expense.payments.map((payment, index) => {
                          const payer = people.find(
                            (p) => p.id === payment.payerId
                          );
                          return (
                            <Box
                              key={index}
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
                                  backgroundColor: payer?.color,
                                }}
                              />
                              {payer?.name} จ่าย ฿ {payment.amount.toFixed(2)}
                            </Box>
                          );
                        })}
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        แบ่งกับ:{" "}
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
                  }
                />
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>
      {/* Who Owes Whom */}
      <Paper sx={{ p: 2 }}>
        <Typography fontSize={18} fontWeight={500} gutterBottom>
          สรุปการชำระเงิน
        </Typography>
        <List>
          {transactions.map((transaction, index) => {
            const fromPerson = people.find((p) => p.id === transaction.from);
            const toPerson = people.find((p) => p.id === transaction.to);
            return (
              <>
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
                    <Box
                      sx={{
                        border: 1,
                        borderColor: "error.main",
                        borderRadius: 1,
                        p: 0.5,
                        minWidth: 100,
                        textAlign: "center",
                      }}
                    >
                      <Typography fontSize={14} fontWeight={600}>
                        ฿ {transaction.amount.toFixed(2)}
                      </Typography>
                    </Box>{" "}
                    <Chip
                      label={`${fromPerson?.name}`}
                      sx={{
                        bgcolor: fromPerson?.color,
                        fontSize: 16,
                      }}
                    />
                    <Typography>ต้องชำระให้</Typography>
                    <Chip
                      label={`${toPerson?.name}`}
                      sx={{
                        bgcolor: toPerson?.color,
                        fontSize: 16,
                      }}
                    />
                  </Stack>
                </Box>
              </>
            );
          })}
        </List>
      </Paper>{" "}
      {/* Balances */}
      <Paper sx={{ p: 2 }}>
        <Typography fontSize={18} fontWeight={500} gutterBottom>
          เงินคงค้าง
        </Typography>
        <Box display={"grid"} gridTemplateColumns={"repeat(3, 1fr)"} gap={1}>
          {people.map((person) => (
            <Box
              key={person.id}
              sx={{
                alignItems: "center",
                gap: 1,
                border: 2,
                borderColor: person.color,
                borderRadius: 2,
                p: 0.5,
                textAlign: "center",
              }}
            >
              {/* <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    backgroundColor: person.color,
                  }}
                /> */}
              <Typography>{person.name}</Typography>
              <Typography
                fontSize={16}
                fontWeight={300}
                color={
                  balances[person.id].toFixed(2) === "0.00"
                    ? "inherit"
                    : balances[person.id] > 0
                      ? "success"
                      : "error"
                }
              >
                ฿ {balances[person.id].toFixed(2)}
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
            setDeleteDialogType("people");
            setDeleteDialogOpen(true);
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
            <AlertTitle>
              คนนี้มีรายการชำระเงิน กรุณาลบรายการชำระเงินก่อน
            </AlertTitle>
          </Alert>
        </Snackbar>
      )}
    </Stack>
  );
}
