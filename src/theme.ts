import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#74bdcb",
      light: "#e7f2f8",
      contrastText: "#000000",
    },
    secondary: {
      main: "#ffa384",
      light: "#efe7bc",
      contrastText: "#000000",
    },
    success: {
      main: "#59981a",
      light: "#ecf87f",
    },
    text: {
      primary: "#363636",
      secondary: "#82868B",
      disabled: "#828282",
    },
    background: {
      default: "#F2F2F2",
    },
  },
  typography: {
    fontFamily: ["Kanit", "Arial", "sans-serif"].join(","),
  },
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: ["Kanit", "Arial", "sans-serif"].join(","),
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: "small", InputLabelProps: { shrink: true } },
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
        },
      },
    },
    MuiSelect: {
      defaultProps: { size: "small" },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          height: "35px !important",
        },
      },
    },
    MuiIconButton: {
      defaultProps: {
        size: "small",
        color: "primary",
      },
    },
    MuiCheckbox: {
      defaultProps: {
        size: "small",
        sx: {
          color: "#e0e0e0",
          pl: 0,
        },
      },
    },
    MuiRadio: {
      defaultProps: {
        size: "small",
        sx: {
          color: "#e0e0e0",
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          fontSize: "14px",
          color: "#4F4F4F",
        },
      },
    },
    MuiChip: {
      defaultProps: {
        size: "small",
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          "& .Mui-selected": {
            backgroundColor: "#FFFFFF",
            boxShadow: "inset 0px 4px 2px rgba(0, 0, 0, 0.05)",
            "&.focus": {
              backgroundColor: "red",
            },
          },
          "& .MuiTab-root": {
            border: "1px solid #E1F5FE",
            backgroundColor: "#FFFFFF",
            "&:first-of-type": {
              borderRadius: "8px 0 0 0",
            },
            "&:last-of-type": {
              borderRadius: "0 8px 0 0",
            },
          },
        },
        indicator: {
          display: "none",
        },
      },
    },
    MuiStack: {
      defaultProps: {
        spacing: 2,
      },
    },
  },
});
