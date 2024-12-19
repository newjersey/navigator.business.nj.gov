import { flipObject, templateEval } from "@/lib/utils/helpers";
import { AcceptedFileType, InputFile } from "@businessnjgovnavigator/shared";
import { ReactElement, useEffect, useLayoutEffect, useRef, useState } from "react";

interface Props {
  acceptedFileTypes?: {
    errorMessage: string;
    fileTypes: AcceptedFileType[];
  };
  maxFileSize?: {
    errorMessage: string;
    maxSizeInMegabytes: number;
  };
  errorMessageRequired: string;
  hasError?: boolean;
  helperText: string;
  value: InputFile | undefined;
  onChange: (file: InputFile) => void;
}

const FileTypeToInputString: Record<AcceptedFileType, string> = {
  PDF: "application/pdf",
  PNG: "image/png",
};

const InputStringToFileType = flipObject(FileTypeToInputString) as Record<string, AcceptedFileType>;

const BYTES_IN_A_MB = 1048576;

const base64ToFile = (params: { base64Contents: string; type: string; filename: string }): File => {
  const imageContent = atob(params.base64Contents);
  const buffer = new ArrayBuffer(imageContent.length);
  const view = new Uint8Array(buffer);

  for (let n = 0; n < imageContent.length; n++) {
    const charCode = imageContent.codePointAt(n);
    if (charCode) {
      view[n] = charCode;
    }
  }

  const blob = new Blob([buffer], { type: params.type });
  return new File([blob], params.filename, { type: params.type });
};

export const FileInput = ({
  acceptedFileTypes,
  errorMessageRequired,
  hasError,
  helperText,
  maxFileSize,
  value,
  onChange,
}: Props): ReactElement<any> => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fileInput = require("../../../../node_modules/@uswds/uswds/packages/usa-file-input/src");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const size = maxFileSize?.maxSizeInMegabytes ? maxFileSize.maxSizeInMegabytes * BYTES_IN_A_MB : undefined;

  const [hasFileBeenRead, setHasFileBeenRead] = useState<boolean>(false);
  const [fileUploadError, setFileUploadError] = useState({ hasError: false, errorMessage: "" });

  const createAcceptedFileString = (): string | undefined => {
    if (!acceptedFileTypes) return undefined;
    return acceptedFileTypes.fileTypes.map((it) => FileTypeToInputString[it]).join(",");
  };

  const getErrorMessage = (): string => {
    if (fileUploadError.hasError) {
      return fileUploadError.errorMessage;
    } else if (hasError) {
      return errorMessageRequired;
    }
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      const uploadedFile = e.target.files[0];
      const reader = new FileReader();

      // eslint-disable-next-line unicorn/prefer-add-event-listener
      reader.onload = function (event: ProgressEvent<FileReader>): void {
        if (!event.target?.result) {
          return;
        }

        setHasFileBeenRead(true);
        onChange({
          base64Contents: (event.target.result as string).split(",")[1],
          sizeInBytes: uploadedFile.size,
          fileType: InputStringToFileType[uploadedFile.type],
          filename: uploadedFile.name,
        });
        setFileUploadError({ hasError: false, errorMessage: "" });
      };
      reader.readAsDataURL(uploadedFile);
    }
  };

  useLayoutEffect(() => {
    const fileInputElement = fileInputRef.current;

    const preventInvalidFileSelection = (e: Event): void => {
      const eventTarget = e.target as HTMLInputElement;
      if (eventTarget.files && eventTarget.files.length > 0) {
        const selectedFile = eventTarget.files[0];
        if (
          acceptedFileTypes &&
          !acceptedFileTypes.fileTypes.includes(InputStringToFileType[selectedFile.type])
        ) {
          e.stopImmediatePropagation();
          setFileUploadError({
            hasError: true,
            errorMessage: templateEval(acceptedFileTypes.errorMessage, { fileName: selectedFile.name }),
          });
        } else if (maxFileSize && size && selectedFile.size > size) {
          e.stopImmediatePropagation();
          setFileUploadError({
            hasError: true,
            errorMessage: templateEval(maxFileSize.errorMessage, {
              fileName: selectedFile.name,
              maxFileSize: `${maxFileSize.maxSizeInMegabytes}`,
            }),
          });
        }
      }
    };

    // Event listener is added to the file input element ahead of USWDS listeners - React onChange will be added after
    fileInputElement?.addEventListener("change", (e: Event) => {
      preventInvalidFileSelection(e);
    });
    if (typeof fileInput.on === "function" && typeof fileInput.off === "function") {
      fileInput.on(fileInputElement); // initialize USWDS fileInput component
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addPreviouslyUploadedFile = (): void => {
    const fileInputElement = fileInputRef.current;
    if (value && fileInputElement?.files?.length === 0) {
      const file = base64ToFile({
        base64Contents: value.base64Contents,
        filename: value.filename,
        type: FileTypeToInputString[value.fileType],
      });

      const dT = new DataTransfer();
      if (fileInputElement) {
        dT.items.add(file);
        fileInputElement.files = dT.files;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        fileInputElement.dispatchEvent(new Event("change", { target: { files: [file] } }));
      }
    }
  };

  useEffect(() => {
    addPreviouslyUploadedFile();
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className={`usa-form-group${hasError || (fileUploadError.hasError && " usa-form-group--error")}`}>
        <label className="usa-label" htmlFor="file-input-single">
          {helperText}
        </label>
        <span className="usa-error-message" id="file-input-error-alert">
          {getErrorMessage()}
        </span>
        <input
          data-testid="file-input"
          accept={createAcceptedFileString()}
          className="usa-file-input"
          id="file-input-single"
          name="file-input-single"
          onChange={handleChange}
          size={size}
          ref={fileInputRef}
          type="file"
        />
      </div>
      <div aria-hidden="true" data-testid={hasFileBeenRead ? "file-is-read" : ""} />
    </>
  );
};
