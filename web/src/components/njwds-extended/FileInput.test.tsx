import { getMergedConfig } from "@/contexts/configContext";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FileInput } from "./FileInput";

describe("<FileInput />", () => {
  let file: File;
  const Config = getMergedConfig();

  beforeEach(() => {
    file = new File(["my cool file contents"], "cool.png", { type: "image/png" });
  });

  it("passes file to onchange handler", async () => {
    const mockOnChange = vi.fn();
    render(
      <FileInput
        errorMessageRequired="error-message-required"
        helperText="input-label"
        onChange={mockOnChange}
        value={undefined}
      />
    );

    const uploader = screen.getByTestId("file-input");

    fireEvent.change(uploader, { target: { files: [file] } });

    const base64Contents = Buffer.from("my cool file contents", "utf8").toString("base64");

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        fileType: "PNG",
        sizeInBytes: file.size,
        base64Contents,
        filename: "cool.png",
      });
    });
  });

  it("refuses files larger than the provided max file size", async () => {
    const mockOnChange = vi.fn();
    const errorMessageFileSize = Config.formation.fields.foreignGoodStandingFile.errorMessageFileSize;

    const halfMegabyteFile = new File(["x".repeat(1048576 / 2)], "cool.png", { type: "image/png" });
    render(
      <FileInput
        maxFileSize={{
          errorMessage: errorMessageFileSize,
          maxSizeInMegabytes: 0.4,
        }}
        errorMessageRequired="error-message-required"
        helperText="input-label"
        onChange={mockOnChange}
        value={undefined}
      />
    );

    const uploader = screen.getByTestId("file-input");

    fireEvent.change(uploader, { target: { files: [halfMegabyteFile] } });

    expect(mockOnChange).not.toHaveBeenCalled();
    expect(screen.getByText("cool.png exceeds maximum size of 0.4 MB.")).toBeInTheDocument();
  });

  it("refuses files of the wrong type", async () => {
    const mockOnChange = vi.fn();
    render(
      <FileInput
        acceptedFileTypes={{
          fileTypes: ["PDF"],
          errorMessage: Config.formation.fields.foreignGoodStandingFile.errorMessageFileType,
        }}
        errorMessageRequired="error-message-required"
        helperText="input-label"
        onChange={mockOnChange}
        value={undefined}
      />
    );

    const uploader = screen.getByTestId("file-input");

    fireEvent.change(uploader, { target: { files: [file] } });

    expect(mockOnChange).not.toHaveBeenCalled();
    expect(screen.getByText("cool.png file format is not supported.")).toBeInTheDocument();
  });
});
