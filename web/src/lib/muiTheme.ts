// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { createTheme } from "@mui/material";

export default createTheme({
  typography: {
    fontFamily: [
      "Public Sans Web",
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "Helvetica",
      "Arial",
      "sans-serif",
      "Apple Color Emoji",
      "Segoe UI Emoji",
      "Segoe UI Symbol",
    ].join(","),
  },
  palette: {
    primary: {
      light: "#7fb135",
      main: "#4b7600",
      dark: "#466c04",
      contrastText: "#f0f0f0",
    },
    secondary: {
      light: "#73b3e7",
      main: "#2378c3",
      dark: "#0050d8",
      contrastText: "#f0f0f0",
    },
    error: {
      light: "#d54309",
      main: "#b51d09",
      dark: "#6f3331",
    },
    text: {
      primary: "#1b1b1b",
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        elevation: 8,
      },
    },
    MuiAccordion: {
      defaultProps: {
        disableGutters: true,
        elevation: 0,
      },
      styleOverrides: {
        rounded: {
          borderRadius: "0px !important",
        },
        root: {
          "&:before": { display: "none" },
        },
      },
    },
    MuiTabPanel: {
      styleOverrides: {
        root: {
          padding: "0px !important",
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          padding: "8px 8px 8px 0px",
          "&:hover": {
            backgroundColor: "#F0F0F0 !important",
          },
          minHeight: "40px",
        },
        content: {
          margin: "0px !important",
        },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          "&.MuiTab-root": {
            "&:focus": {
              outline: ".25rem solid #38536f",
            },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: "#38536f !important",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: "4px !important",
          backgroundColor: "#38536f !important",
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: "0px",
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontWeight: 800,
          marginLeft: 2,
          fontSize: 16,
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          marginRight: "4px",
          "&:hover": {
            backgroundColor: "#e6e6e6",
          },
        },
      },
      variants: [
        {
          props: {
            color: "error",
          },
          style: {
            color: "#b51d09",
            ".MuiSvgIcon-root": {
              boxShadow: "inset 0 0 0 3px #B51D0926, 0 0 0 2px #B51D0926",
              borderRadius: "50%",
            },
          },
        },
      ],
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          marginRight: "4px",
          "&.Mui-disabled": {
            color: "#adadad",
          },
          "&:hover": {
            backgroundColor: "#e6e6e6",
          },
        },
      },
      variants: [
        {
          props: {
            color: "error",
          },
          style: {
            color: "#b51d09",
            ".MuiSvgIcon-root": {
              boxShadow: "inset 0 0 0 4px #B51D0926",
              borderRadius: "10%",
            },
          },
        },
      ],
    },
    MuiInputBase: {
      styleOverrides: {
        root: { marginTop: "4px" },
        input: { padding: "12.5px 12px" },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: { padding: "12.5px 12px" },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        inputRoot: { padding: "5px 9px" },
        option: {
          "&:nth-of-type(even)": {
            backgroundColor: "#F9FBFB",
          },
          "&:nth-of-type(odd)": {
            backgroundColor: "#FFFFFF",
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          padding: "8px 24px 8px 0px",
          "&.Mui-disabled": {
            color: "inherit",
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&.Mui-disabled": {
            backgroundColor: "#f0f0f0",
          },
          input: {
            padding: "12.5px 12px",
            "&.Mui-disabled": {
              color: "#1b1b1b",
              webkitTextFillColor: "#1b1b1b",
            },
          },
        },
      },
    },
  },
});
