import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import html2canvas from "html2canvas";
import { useEffect, useRef, useState } from "react";
import { CustomSnackbar } from "../components/CustomSnackbar";
import { DeleteDialog } from "../dialog/deleteDialog";
import { Expense, useExpenses } from "../hooks/useExpenses";
import { useGroups } from "../hooks/useGroups";
import { useSnackbar } from "../hooks/useSnackbar";
import { DeleteIcon, EditIcon, HomeIcon, SaveAltIcon } from "../icons";

interface PaymentInput {
  payerId: string;
  amount: string;
}

interface SharedAmountInput {
  personId: string;
  amount: string;
}

function RouteComponent() {
  const {
    expenses,
    people,
    addExpense,
    addPerson,
    totalExpenses,
    calculateTransactions,
    deletePerson,
    deleteExpense,
    editExpense,
    clearPeopleData,
    clearExpensesData,
  } = useExpenses();
  const { groupId } = Route.useSearch();
  const { deleteGroup, currentGroup } = useGroups();
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const transactionsRef = useRef<HTMLDivElement>(null);
  const expensesRef = useRef<HTMLDivElement>(null);
  const editPaperRef = useRef<HTMLDivElement>(null);
  const expensePerPersonRef = useRef<HTMLDivElement>(null);
  const isSmallScreen = useMediaQuery("(max-width: 600px)");
  const [expenseName, setExpenseName] = useState("");
  const [newPersonName, setNewPersonName] = useState("");
  const [sharedWith, setSharedWith] = useState<SharedAmountInput[]>([]);
  const [payments, setPayments] = useState<PaymentInput[]>([
    { payerId: "", amount: "" },
  ]);
  const [sharedType, setSharedType] = useState<"equal" | "perPerson">("equal");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDialogType, setDeleteDialogType] = useState<
    "person" | "expense" | "people" | "expenses" | null
  >(null);
  const [deletePersonId, setDeletePersonId] = useState<string | null>(null);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
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
    if (sharedWith.some((s) => !s.personId || !s.amount)) return;

    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    const totalSharedAmount = sharedWith.reduce(
      (sum, s) => sum + Number(s.amount),
      0
    );

    if (Math.abs(totalAmount - totalSharedAmount) > 0.01) {
      showSnackbar("ยอดเงินที่หารต้องเท่ากับยอดเงินรวม", "error");
      return;
    }

    const expenseData = {
      name: expenseName,
      totalAmount,
      date: new Date().toISOString(),
      payments: payments.map((p) => ({
        payerId: p.payerId,
        amount: Number(p.amount),
      })),
      sharedWith: sharedWith.map((s) => ({
        personId: s.personId,
        amount: Number(s.amount),
      })),
    };

    if (editingExpenseId) {
      editExpense(editingExpenseId, expenseData);
      setEditingExpenseId(null);
    } else {
      addExpense(expenseData);
    }

    setExpenseName("");
    setPayments([{ payerId: "", amount: "" }]);
    setSharedWith([{ personId: "", amount: "" }]);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setTimeout(() => {
      editPaperRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    const expense = expenses.find((e) => e.id === editingExpenseId);
    if (!expense) return;
    if (
      expense.sharedWith.every(
        (item) => item.amount === expense.sharedWith[0].amount
      )
    ) {
      setSharedType("equal");
    } else {
      setSharedType("perPerson");
    }
    setExpenseName(expense.name);
    setPayments(
      expense.payments.map((p) => ({
        payerId: p.payerId,
        amount: p.amount.toString(),
      }))
    );
    setSharedWith(
      expense.sharedWith.map((s) => ({
        personId: s.personId,
        amount: s.amount.toString(),
      }))
    );
  }, [editingExpenseId]);

  const handleCancelEdit = () => {
    setEditingExpenseId(null);
    setExpenseName("");
    setPayments([{ payerId: "", amount: "" }]);
    setSharedWith([{ personId: "", amount: "" }]);
  };

  const transactions = calculateTransactions();

  const handleAddSharedPerson = () => {
    setSharedWith([...sharedWith, { personId: "", amount: "" }]);
  };

  const handleRemoveSharedPerson = (index: number) => {
    setSharedWith(sharedWith.filter((_, i) => i !== index));
  };

  const handleSharedAmountChange = (
    index: number,
    field: keyof SharedAmountInput,
    value: string
  ) => {
    const newSharedWith = [...sharedWith];
    newSharedWith[index] = { ...newSharedWith[index], [field]: value };
    setSharedWith(newSharedWith);
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

      showSnackbar("บันทึกรูปภาพสำเร็จ", "success");
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

      showSnackbar("บันทึกรูปภาพสำเร็จ", "success");
    } catch (error) {
      console.error("Error saving image:", error);
    }
  };

  const handleSaveExpensePerPersonImage = async () => {
    if (!expensePerPersonRef.current) return;

    try {
      const canvas = await html2canvas(expensePerPersonRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "harn-gun-na-expenses-per-person.png";
      link.href = image;
      link.click();

      showSnackbar("บันทึกรูปภาพสำเร็จ", "success");
    } catch (error) {
      console.error("Error saving image:", error);
    }
  };

  useEffect(() => {
    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    if (sharedType === "equal") {
      setSharedWith(
        people.map((p) => ({
          personId: p.id,
          amount:
            totalAmount > 0 ? (totalAmount / people.length).toString() : "0",
        }))
      );
    }
  }, [payments]);

  useEffect(() => {
    if (sharedType === "equal") {
      const totalAmount = payments.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      );
      const equalAmount = (totalAmount / people.length).toString();
      setSharedWith(
        people.map((p) => ({
          personId: p.id,
          amount: equalAmount,
        }))
      );
    } else {
      setSharedWith(
        people.map((p) => ({
          personId: p.id,
          amount: sharedWith.find((s) => s.personId === p.id)?.amount || "",
        }))
      );
    }
  }, [sharedType]);

  return (
    <Stack
      spacing={1}
      sx={{
        py: 2,
        minWidth: { xs: "100%", sm: "80vw", md: "80vw" },
      }}
    >
      <Typography
        component={"span"}
        align="center"
        fontSize={24}
        fontWeight={600}
      >
        💰 {currentGroup?.name} 💰
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
                      expense.sharedWith.some(
                        (shared) => shared.personId === person.id
                      )
                    )
                  ) {
                    showSnackbar(
                      "มีรายการชำระเงิน กรุณาลบรายการชำระเงินก่อน",
                      "error"
                    );
                  } else {
                    setDeletePersonId(person.id);
                    setDeleteDialogType("person");
                    deletePerson(person.id);
                    setSharedWith(
                      sharedWith.filter((s) => s.personId !== person.id)
                    );
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
                      <MenuItem
                        key={person.id}
                        value={person.id}
                        disabled={payments.some((p) => p.payerId === person.id)}
                      >
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
                    label="จำนวนเงิน"
                    type="number"
                    value={payment.amount}
                    onChange={(e) =>
                      handlePaymentChange(index, "amount", e.target.value)
                    }
                    required
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
            <RadioGroup
              value={sharedType}
              onChange={(e) =>
                setSharedType(e.target.value as "equal" | "perPerson")
              }
              row
            >
              <FormControlLabel
                value="equal"
                control={<Radio />}
                label="หารเท่ากัน"
              />
              <FormControlLabel
                value="perPerson"
                control={<Radio />}
                label="หารรายคน"
              />
            </RadioGroup>

            {sharedType === "equal" && (
              <FormControl fullWidth required>
                <InputLabel size="small" shrink>
                  หารกับ
                </InputLabel>
                <Select
                  multiple
                  value={sharedWith.map((s) => s.personId)}
                  onChange={(e) => {
                    const selectedPersonIds = e.target.value as string[];
                    const totalAmount = payments.reduce(
                      (sum, p) => sum + Number(p.amount),
                      0
                    );
                    const equalAmount =
                      totalAmount > 0
                        ? (totalAmount ? totalAmount : 0) /
                          selectedPersonIds.length
                        : "0";
                    setSharedWith(
                      selectedPersonIds.map((personId) => ({
                        personId,
                        amount: equalAmount.toString(),
                      }))
                    );
                  }}
                  label="หารกับ"
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((personId) => {
                        const person = people.find((p) => p.id === personId);
                        const amount =
                          sharedWith.find((s) => s.personId === personId)
                            ?.amount || "0";
                        return (
                          <Chip
                            key={personId}
                            label={`${person?.name} ฿ ${
                              amount
                                ? Number(amount).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                                : "0"
                            }`}
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
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
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
            )}
            {sharedType === "perPerson" && (
              <>
                {sharedWith.length > 0 && (
                  <Stack spacing={2}>
                    <Typography component={"span"} variant="subtitle1">
                      ระบุจำนวนเงินที่หารแต่ละคน (
                      <Typography
                        component={"span"}
                        variant="subtitle1"
                        color={
                          sharedWith.reduce(
                            (sum, s) => sum + Number(s.amount),
                            0
                          ) !==
                          payments.reduce((sum, p) => sum + Number(p.amount), 0)
                            ? "error"
                            : "success"
                        }
                      >
                        {sharedWith.reduce(
                          (sum, s) => sum + Number(s.amount),
                          0
                        )}
                      </Typography>
                      /
                      <Typography component={"span"} variant="subtitle1">
                        {payments.reduce((sum, p) => sum + Number(p.amount), 0)}
                      </Typography>
                      )
                    </Typography>
                    {sharedWith.map((shared, index) => {
                      return (
                        <Stack
                          key={index}
                          direction="row"
                          spacing={2}
                          alignItems="center"
                        >
                          <FormControl sx={{ flex: 1 }} required>
                            <InputLabel size="small" shrink>
                              คนที่หาร
                            </InputLabel>
                            <Select
                              value={shared.personId}
                              onChange={(e) =>
                                handleSharedAmountChange(
                                  index,
                                  "personId",
                                  e.target.value
                                )
                              }
                              label="คนที่หาร"
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
                                <MenuItem
                                  key={person.id}
                                  value={person.id}
                                  disabled={sharedWith.some(
                                    (s) => s.personId === person.id
                                  )}
                                >
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
                            label="จำนวนเงิน"
                            type="number"
                            value={shared.amount}
                            onChange={(e) =>
                              handleSharedAmountChange(
                                index,
                                "amount",
                                e.target.value
                              )
                            }
                            required
                            disabled={
                              people.length === 0 || shared.personId === ""
                            }
                            sx={{ width: "150px" }}
                          />
                          {sharedWith.length > 1 && (
                            <IconButton
                              onClick={() => handleRemoveSharedPerson(index)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </Stack>
                      );
                    })}
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={handleAddSharedPerson}
                      sx={{ alignSelf: "flex-start" }}
                      color="success"
                      startIcon={"👥"}
                      disabled={sharedWith.length === people.length}
                    >
                      เพิ่มคนที่หาร
                    </Button>
                  </Stack>
                )}
              </>
            )}
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
                      หารกับ:
                    </Typography>
                    {expense.sharedWith.map((shared) => {
                      const person = people.find(
                        (p) => p.id === shared.personId
                      );
                      return (
                        <Chip
                          key={shared.personId}
                          label={`${person?.name} ฿ ${shared.amount.toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}`}
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
      {/* <Paper ref={balanceCardsRef} sx={{ p: 2 }}>
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
      </Paper> */}
      {/* Expense by person */}
      <Paper ref={expensePerPersonRef} sx={{ p: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography component={"span"} fontSize={18} fontWeight={500}>
            ค่าใช้จ่ายต่อคน
          </Typography>
          <Tooltip title="บันทึกเป็นรูปภาพ">
            <IconButton
              onClick={handleSaveExpensePerPersonImage}
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
        <Stack spacing={1}>
          {people.map((person) => {
            const totalSharedAmount = expenses.reduce((sum, expense) => {
              const personShared = expense.sharedWith.filter(
                (shared) => shared.personId === person.id
              );
              return (
                sum +
                personShared.reduce((sum, shared) => sum + shared.amount, 0)
              );
            }, 0);

            const totalPaidAmount = expenses.reduce((sum, expense) => {
              const personPayments = expense.payments.filter(
                (payment) => payment.payerId === person.id
              );
              return (
                sum +
                personPayments.reduce(
                  (paymentSum, payment) => paymentSum + payment.amount,
                  0
                )
              );
            }, 0);

            // Calculate balance (positive = they're owed money, negative = they owe money)
            const balance = totalPaidAmount - totalSharedAmount;

            return (
              <Box
                key={person.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1,
                  px: 0,
                }}
              >
                <Chip
                  label={person.name}
                  sx={{
                    bgcolor: person.color,
                  }}
                />
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography component={"span"} fontSize={14}>
                    ฿
                    {totalPaidAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    /
                  </Typography>
                  <Typography
                    component={"span"}
                    fontSize={14}
                    color="text.secondary"
                  >
                    ฿
                    {totalSharedAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                  <Typography
                    component={"span"}
                    fontSize={16}
                    fontWeight={500}
                    color={
                      balance === 0
                        ? "inherit"
                        : balance > 0
                          ? "success.main"
                          : "error.main"
                    }
                  >
                    {balance >= 0 ? "+" : ""}฿
                    {balance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </Paper>
      {/* Clear data */}
      <Stack justifyContent={"center"} alignItems={"center"} width={1}>
        <Button
          variant="contained"
          color="info"
          onClick={() => {
            navigate({ to: "/" });
          }}
          sx={{ width: "fit-content", color: "white" }}
        >
          <HomeIcon fontSize="small" /> Home
        </Button>
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              deleteGroup(groupId);
              navigate({ to: "/" });
            }}
          >
            <DeleteIcon fontSize="small" /> กลุ่ม
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              if (expenses.length > 0) {
                showSnackbar(
                  "มีรายการชำระเงิน กรุณาลบรายการชำระเงินก่อน",
                  "error"
                );
              } else {
                setDeleteDialogType("people");
                setDeleteDialogOpen(true);
              }
            }}
            sx={{ width: "fit-content" }}
          >
            <DeleteIcon fontSize="small" /> คน
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
            <DeleteIcon fontSize="small" /> รายการ
          </Button>
        </Stack>
      </Stack>

      {deleteDialogOpen && (
        <DeleteDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onDelete={handleDelete}
        />
      )}

      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={closeSnackbar}
      />
    </Stack>
  );
}

export const Route = createFileRoute("/harngunna")({
  component: RouteComponent,
  validateSearch: (search) => {
    if (typeof search.groupId !== "string") {
      throw new Error("Missing or invalid groupId in search params");
    }
    return {
      groupId: search.groupId,
    };
  },
});
