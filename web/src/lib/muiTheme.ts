export default {
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
    MuiInputBase: {
      styleOverrides: {
        root: { marginTop: "0px" },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&.Mui-disabled": {
            backgroundColor: "#f0f0f0",
          },
          input: {
            "&.Mui-disabled": {
              color: "#1b1b1b",
              webkitTextFillColor: "#1b1b1b",
            },
          },
        },
      },
    },
  },
};
