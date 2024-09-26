import { Content } from "@/components/Content";
import { Heading } from "@/components/njwds-extended/Heading";
import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { AddressModal } from "@/components/tasks/business-formation/contacts/AddressModal";
import { WithErrorBar } from "@/components/WithErrorBar";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { MediaQueries } from "@/lib/PageSizes";
import { FormationFields, FormationIncorporator, FormationMember } from "@businessnjgovnavigator/shared/";
import { Checkbox, IconButton, useMediaQuery } from "@mui/material";
import React, { ChangeEvent, Fragment, ReactElement, ReactNode, useState } from "react";

interface DisplayContent {
  header: string;
  subheader?: string;
  description: string;
  modalTitle: string;
  modalSaveButton: string;
  placeholder: string;
  newButtonText: string;
  snackbarHeader: string;
  snackbarBody: string;
  defaultCheckbox?: string;
  error?: string;
}

interface Props<T> {
  defaultAddress?: Partial<T>;
  fieldName: FormationFields;
  addressData: T[];
  setData: (addressData: T[]) => void;
  needSignature?: boolean;
  createEmptyAddress: () => T;
  displayContent: DisplayContent;
  legalType: string;
  hasError: boolean;
}

export const Addresses = <T extends FormationMember | FormationIncorporator>(
  props: Props<T>
): ReactElement => {
  const { Config } = useConfig();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editIndex, setEditIndex] = useState<number | undefined>(undefined);
  const [alert, setAlert] = useState<boolean | undefined>(undefined);
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const { doesFieldHaveError } = useFormationErrors();

  const formatAddress = (address: T): string => {
    return `${address.addressLine1}, ${address.addressLine2 ? `${address.addressLine2},` : ""} ${
      address.addressMunicipality?.displayName ?? address.addressCity
    }, ${address.addressState?.name} ${address.addressZipCode}`;
  };

  const handleSignerCheckbox = (event: ChangeEvent<HTMLInputElement>, index: number): void => {
    const addresses = [...props.addressData];
    addresses[index] = {
      ...addresses[index],
      signature: event.target.checked,
    };
    props.setData(addresses);
  };

  const renderSignatureColumn = ({
    onChange,
    checked,
    fieldName,
    index,
  }: {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    checked: boolean;
    fieldName: FormationFields;
    index?: number;
  }): ReactNode => {
    return (
      <div className="grid-col-auto width-6 display-flex flex-column flex-align-center flex-justify-center">
        <label
          htmlFor={index ? `signature-checkbox-${fieldName}-${index}` : `signature-checkbox-${fieldName}`}
          className="text-bold"
          style={{ display: "none" }}
        >
          {Config.formation.fields.signers.signColumnLabel}*
        </label>
        <div style={{ height: "56px" }} className="display-flex flex-column flex-justify-center">
          <Checkbox
            id={index ? `signature-checkbox-${fieldName}-${index}` : `signature-checkbox-${fieldName}`}
            onChange={onChange}
            checked={checked}
            {...(doesFieldHaveError(fieldName) && !checked ? { color: "error" } : {})}
          />
        </div>
      </div>
    );
  };

  const deleteAddress = (index: number): void => {
    props.setData([...[...props.addressData].slice(0, index), ...[...props.addressData].slice(index + 1)]);
  };

  const zebraOnOdd = (index: number): string => (index % 2 === 1 ? "bg-base-extra-light" : "");

  const renderDesktopTable = (
    <table className={`addresses margin-top-2 margin-bottom-3`}>
      <thead>
        <tr>
          {Config.formation.fields.signers.tableHeader
            .split(",")
            .filter((_, index) => {
              return props.needSignature ? true : index !== 2;
            })
            .map((value: string) => {
              return (
                <th className="margin-bottom-2" key={value.toLowerCase()}>
                  {value}
                </th>
              );
            })}
        </tr>
      </thead>
      <tbody>
        {props.addressData.length > 0 ? (
          props.addressData.map((it, index) => {
            return (
              <Fragment key={index}>
                <tr
                  className={`margin-bottom-1 ${zebraOnOdd(index)}`}
                  key={index}
                  data-testid={`${props.fieldName}-${index}`}
                >
                  <td className="break-word">{it.name}</td>
                  <td className="break-word">{formatAddress(it)}</td>
                  {"signature" in it ? (
                    <td className="padding-y-0">
                      {renderSignatureColumn({
                        onChange: (event) => {
                          return handleSignerCheckbox(event, index);
                        },
                        checked: it.signature,
                        fieldName: props.fieldName,
                        index,
                      })}
                    </td>
                  ) : (
                    <></>
                  )}
                  <td className="display-inline-flex">
                    <div>
                      <IconButton
                        aria-label="edit"
                        onClick={(): void => {
                          setEditIndex(index);
                          setModalOpen(true);
                        }}
                        className="usa-button usa-button--unstyled"
                      >
                        <Icon className="usa-icon--size-3">edit</Icon>
                      </IconButton>
                    </div>
                    <div className="margin-x-1 border-1px border-base-light" />
                    <div>
                      <IconButton
                        aria-label="delete"
                        onClick={(): void => deleteAddress(index)}
                        className="usa-button usa-button--unstyled"
                      >
                        <Icon className="usa-icon--size-3">delete</Icon>
                      </IconButton>
                    </div>
                  </td>
                </tr>
                {doesFieldHaveError(props.fieldName) && "signature" in it && !it.signature && (
                  <tr className={zebraOnOdd(index)} key={`error-${index}`}>
                    <td colSpan={4} className="text-error-dark text-bold">
                      {Config.formation.fields.signers.errorBannerCheckbox}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })
        ) : (
          <></>
        )}
      </tbody>
      <tfoot>
        {props.hasError ? (
          <tr>
            <td colSpan={3} className={"text-error-dark text-bold"}>
              {props.displayContent.error}
            </td>
          </tr>
        ) : props.addressData.length === 0 ? (
          <tr>
            <td colSpan={4}>{props.displayContent.placeholder}</td>
          </tr>
        ) : (
          <></>
        )}
      </tfoot>
    </table>
  );

  const renderMobileTable = (
    <>
      <table data-testid={`addresses-${props.fieldName}-table-mobile`} className="margin-y-2">
        <tbody>
          {props.addressData.length > 0 ? (
            props.addressData.map((it, index) => {
              return (
                <Fragment key={index}>
                  <tr className={`margin-bottom-1 ${zebraOnOdd(index)}`}>
                    <td className="flex-column">
                      <div className="flex-column">
                        <div className="margin-bottom-2 break-word">{it.name}</div>
                        <div className="break-word">{it.addressLine1}</div>
                        <div className="break-word">{it.addressLine2}</div>
                        <div className="margin-bottom-2">
                          {it.addressCity}, {it.addressState?.name} {it.addressZipCode}
                        </div>
                      </div>
                      <div className="flex flex-row fac fjb">
                        <span className="flex fac">
                          {"signature" in it ? (
                            <>
                              <Content>{`${Config.formation.fields.signers.signColumnLabel}*`}</Content>
                              <div>
                                {renderSignatureColumn({
                                  onChange: (event) => {
                                    return handleSignerCheckbox(event, index);
                                  },
                                  checked: it.signature,
                                  fieldName: props.fieldName,
                                  index,
                                })}
                              </div>
                            </>
                          ) : (
                            <></>
                          )}
                        </span>
                        <span>
                          <span className="vertical-line border-base-light padding-y-05 padding-right-2 margin-right-2">
                            <IconButton
                              aria-label="edit"
                              onClick={(): void => {
                                setEditIndex(index);
                                setModalOpen(true);
                              }}
                              className="usa-button usa-button--unstyled width-auto"
                            >
                              <Icon className="usa-icon--size-3">edit</Icon>
                            </IconButton>
                          </span>
                          <IconButton
                            aria-label="delete"
                            onClick={(): void => deleteAddress(index)}
                            className="usa-button usa-button--unstyled width-auto"
                          >
                            <Icon className="usa-icon--size-3">delete</Icon>
                          </IconButton>
                        </span>
                      </div>
                    </td>
                  </tr>
                  {doesFieldHaveError(props.fieldName) && "signature" in it && !it.signature ? (
                    <tr className={`margin-bottom-1 ${zebraOnOdd(index)}`} key={`error-${index}`}>
                      <td className="flex-column text-error-dark text-bold">
                        {Config.formation.fields.signers.errorBannerCheckbox}
                      </td>
                    </tr>
                  ) : (
                    <></>
                  )}
                </Fragment>
              );
            })
          ) : (
            <></>
          )}
        </tbody>
        <tfoot>
          {props.hasError ? (
            <tr>
              <td colSpan={3} className={"text-error-dark text-bold"}>
                {props.displayContent.error}
              </td>
            </tr>
          ) : props.addressData.length === 0 ? (
            <tr>
              <td colSpan={4}>{props.displayContent.placeholder}</td>
            </tr>
          ) : (
            <></>
          )}
        </tfoot>
      </table>
    </>
  );
  return (
    <>
      {alert && (
        <SnackbarAlert
          variant="success"
          isOpen={true}
          close={(): void => setAlert(undefined)}
          dataTestid="snackbar-alert-success"
          heading={props.displayContent.snackbarHeader}
        >
          {props.displayContent.snackbarBody}
        </SnackbarAlert>
      )}
      <div className="margin-bottom-3 members-table" data-testid={`addresses-${props.fieldName}`}>
        <Heading level={2} styleVariant={"h3"} style={{ display: "inline" }}>
          {props.displayContent.header}
        </Heading>
        {props.displayContent.subheader && (
          <span className="margin-left-1">
            <span className="h6-styling">{props.displayContent.subheader}</span>
          </span>
        )}
        <Content className="margin-top-1">{props.displayContent.description}</Content>
        <div>
          <WithErrorBar hasError={doesFieldHaveError(props.fieldName)} type="ALWAYS">
            {isTabletAndUp ? renderDesktopTable : renderMobileTable}
          </WithErrorBar>
          {props.addressData.length <= 9 && (
            <UnStyledButton
              onClick={(): void => {
                setEditIndex(undefined);
                setModalOpen(true);
              }}
            >
              <Icon>add</Icon>
              <span
                className="text-underline"
                style={{ textUnderlinePosition: "under" }}
                data-testid={`addresses-${props.fieldName}-newButtonText`}
              >
                {props.displayContent.newButtonText}
              </span>
            </UnStyledButton>
          )}
        </div>
      </div>
      {props.needSignature ? (
        <p className="margin-bottom-2">
          <em>* {Config.formation.fields.signers.aidText}</em>
        </p>
      ) : (
        <></>
      )}
      <AddressModal<T>
        open={modalOpen}
        key={`${editIndex}-${props.fieldName}`}
        createEmptyAddress={props.createEmptyAddress}
        fieldName={props.fieldName}
        handleClose={(): void => setModalOpen(false)}
        setData={(addressData): void => props.setData(addressData)}
        index={editIndex}
        defaultAddress={props.defaultAddress}
        displayContent={{ ...props.displayContent }}
        addressData={props.addressData}
        onSave={(): void => setAlert(true)}
      />
    </>
  );
};
