import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { ToastAlert } from "@/components/njwds-extended/ToastAlert";
import { Icon } from "@/components/njwds/Icon";
import { AddressModal } from "@/components/tasks/business-formation/contacts/AddressModal";
import { ValidatedCheckbox } from "@/components/ValidatedCheckbox";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { MediaQueries } from "@/lib/PageSizes";
import { FormationFields } from "@/lib/types/types";
import styles from "@/styles/sections/members.module.scss";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { FormationAddress } from "@businessnjgovnavigator/shared/";
import { IconButton, useMediaQuery } from "@mui/material";
import React, { ChangeEvent, ReactElement, useContext, useState } from "react";

const formatAddress = (address: FormationAddress) =>
  `${address.addressLine1}, ${address.addressLine2 ? `${address.addressLine2},` : ""} ${
    address.addressCity
  }, ${address.addressState} ${address.addressZipCode}`;

interface DisplayContent {
  title: string;
  defaultCheckbox?: string;
  saveButton: string;
  contentMd: string;
  placeholder: string;
  newButtonText: string;
  alertHeader: string;
  alertBody: string;
}

interface Props {
  defaultAddress?: FormationAddress;
  fieldName: FormationFields;
  addressData: FormationAddress[];
  setData: (addressData: FormationAddress[]) => void;
  needSignature?: boolean;
  displayContent: DisplayContent;
}

export const Addresses = (props: Props): ReactElement => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editIndex, setEditIndex] = useState<number | undefined>(undefined);
  const [alert, setAlert] = useState<boolean | undefined>(undefined);
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const { state, setErrorMap } = useContext(BusinessFormationContext);

  const handleSignerCheckbox = (event: ChangeEvent<HTMLInputElement>, index: number): void => {
    const addresses = [...props.addressData];
    addresses[index] = {
      ...addresses[index],
      signature: event.target.checked,
    };
    props.setData(addresses);
    if (event.target.checked && props.addressData.every((it) => it.signature && it.name)) {
      setErrorMap({ ...state.errorMap, [props.fieldName]: { invalid: false } });
    }
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
  }) => {
    return (
      <div className="grid-col-auto width-6 display-flex flex-column flex-align-center flex-justify-center">
        <label
          htmlFor={index ? `signature-checkbox-${fieldName}-${index}` : `signature-checkbox-${fieldName}`}
          className="text-bold"
          style={{ display: "none" }}
        >
          {Config.businessFormationDefaults.signatureColumnLabel}*
        </label>
        <div style={{ height: "56px" }} className="display-flex flex-column flex-justify-center">
          <ValidatedCheckbox
            id={index ? `signature-checkbox-${fieldName}-${index}` : `signature-checkbox-${fieldName}`}
            onChange={onChange}
            checked={checked}
            error={state.errorMap[fieldName].invalid && !checked}
          />
        </div>
      </div>
    );
  };

  const deleteAddress = (index: number) =>
    props.setData([...[...props.addressData].slice(0, index), ...[...props.addressData].slice(index + 1)]);

  const renderDesktopTable = (
    <table className={`addresses margin-top-2 margin-bottom-3`}>
      <thead>
        <tr>
          {Config.businessFormationDefaults.addressesTableColumn
            .split(",")
            .filter((_, index) => (props.needSignature ? true : index != 2))
            .map((value: string) => (
              <th className="margin-bottom-2" key={value.toLowerCase()}>
                {value}
              </th>
            ))}
        </tr>
      </thead>
      <tbody>
        {props.addressData.length > 0 ? (
          props.addressData.map((it, index) => {
            return (
              <tr className="margin-bottom-1" key={index} data-testid={`${props.fieldName}-${index}`}>
                <td>{it.name}</td>
                <td>{formatAddress(it)}</td>
                {props.needSignature ? (
                  <td className="padding-y-0">
                    {" "}
                    {renderSignatureColumn({
                      onChange: (event) => handleSignerCheckbox(event, index),
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
                      onClick={() => {
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
                      onClick={() => {
                        deleteAddress(index);
                      }}
                      className="usa-button usa-button--unstyled"
                    >
                      <Icon className="usa-icon--size-3">delete</Icon>
                    </IconButton>
                  </div>
                </td>
              </tr>
            );
          })
        ) : (
          <></>
        )}
      </tbody>
      <tfoot>
        {props.addressData.length === 0 ? (
          <tr>
            <td colSpan={4}>{props.displayContent.placeholder}</td>
          </tr>
        ) : (
          <></>
        )}
      </tfoot>
    </table>
  );
  const renderMobileTable =
    props.addressData.length > 0 ? (
      <>
        <table
          data-testid={`addresses-${props.fieldName}-table-mobile`}
          className={`addresses-mobile margin-y-2`}
        >
          <tbody>
            {props.addressData.map((it, index) => (
              <tr key={index}>
                <td className="flex-column">
                  <div className="flex-column">
                    <div className="margin-bottom-2">{it.name}</div>
                    <div>{it.addressLine1}</div>
                    <div>{it.addressLine2}</div>
                    <div className="margin-bottom-2">
                      {it.addressCity}, {it.addressState} {it.addressZipCode}
                    </div>
                  </div>
                  <div className="flex flex-row fac fjb">
                    <span className="flex fac">
                      {props.needSignature ? (
                        <>
                          {" "}
                          <Content>{`${Config.businessFormationDefaults.signatureColumnLabel}*`}</Content>
                          <div>
                            {renderSignatureColumn({
                              onChange: (event) => handleSignerCheckbox(event, index),
                              checked: it.signature,
                              fieldName: "signers",
                              index,
                            })}{" "}
                          </div>
                        </>
                      ) : (
                        <></>
                      )}
                    </span>
                    <span>
                      <span className="vl border-base-light padding-y-05 padding-right-2 margin-right-2">
                        <IconButton
                          aria-label="edit"
                          onClick={() => {
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
                        onClick={() => {
                          deleteAddress(index);
                        }}
                        className="usa-button usa-button--unstyled width-auto"
                      >
                        <Icon className="usa-icon--size-3">delete</Icon>
                      </IconButton>
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    ) : (
      <div className="margin-bottom-3"></div>
    );

  return (
    <>
      {alert && (
        <ToastAlert
          variant="success"
          isOpen={alert !== undefined}
          close={() => setAlert(undefined)}
          dataTestid="toast-alert-success"
          heading={props.displayContent.alertHeader}
        >
          {props.displayContent.alertBody}
        </ToastAlert>
      )}
      <div className={`margin-bottom-3 ${styles.membersTable}`} data-testid={`addresses-${props.fieldName}`}>
        <Content
          overrides={{
            h3: ({ children }: { children: string[] }): ReactElement => (
              <h3 style={{ display: "inline" }}>{children}</h3>
            ),
          }}
        >
          {props.displayContent.contentMd}
        </Content>
        {isTabletAndUp ? renderDesktopTable : renderMobileTable}
        {props.addressData.length <= 9 && (
          <Button
            style="tertiary"
            onClick={() => {
              setEditIndex(undefined);
              setModalOpen(true);
            }}
          >
            <Icon>add</Icon>{" "}
            <span
              className="text-underline"
              style={{ textUnderlinePosition: "under" }}
              data-testid={`addresses-${props.fieldName}-newButtonText`}
            >
              {props.displayContent.newButtonText}
            </span>
          </Button>
        )}
      </div>
      {props.needSignature ? (
        <p className="margin-bottom-2">
          <i>* {Config.businessFormationDefaults.signatureAidText}</i>
        </p>
      ) : (
        <></>
      )}
      <AddressModal
        open={modalOpen}
        key={`${editIndex}-${props.fieldName}`}
        fieldName={props.fieldName}
        handleClose={() => setModalOpen(false)}
        setData={(addressData) => props.setData(addressData)}
        index={editIndex}
        defaultAddress={props.defaultAddress}
        displayContent={{ ...props.displayContent }}
        addressData={props.addressData}
        onSave={() => setAlert(true)}
      />
    </>
  );
};
