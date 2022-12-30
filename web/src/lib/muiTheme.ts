import { createTheme } from "@mui/material";
import { red } from "@mui/material/colors";

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
      dark: "#162e51",
      contrastText: "#f0f0f0",
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
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: { padding: "0px" },
        content: {
          margin: "0px",
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
          "&.Mui-error": {
            color: "#b50909",
          },
        },
      },
    },
    MuiRadio: {
      variants: [
        {
          props: {
            color: "error" as
              | "error"
              | "default"
              | "info"
              | "primary"
              | "success"
              | "warning"
              | "secondary"
              | undefined,
          },
          style: {
            color: red[800],
            "&.Mui-checked": {
              color: red[600],
            },
            ".MuiSvgIcon-root": {
              boxShadow: "inset 0 0 0 3px #B51D0926, 0 0 0 2px #B51D0926",
              borderRadius: "50%",
            },
          },
        },
      ],
    },

    MuiInputBase: {
      styleOverrides: {
        root: { marginTop: "0px" },
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
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&.Mui-disabled": {
            backgroundColor: "#f0f0f0",
          },
          "&.Mui-error .MuiOutlinedInput-notchedOutline": {
            borderColor: "#b50909",
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
