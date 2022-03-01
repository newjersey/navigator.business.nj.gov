import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { ToastAlert } from "@/components/njwds-extended/ToastAlert";
import { Icon } from "@/components/njwds/Icon";
import { FormationContext } from "@/components/tasks/BusinessFormation";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { FormationMember } from "@businessnjgovnavigator/shared";
import { IconButton } from "@mui/material";
import React, { ReactElement, useContext, useState } from "react";
import styles from "../../../styles/sections/members.module.scss";
import { MembersModal } from "./MembersModal";

export const formatAddress = (member: FormationMember) =>
  `${member.addressLine1}, ${member.addressLine2 ? `${member.addressLine2},` : ""} ${member.addressCity}, ${
    member.addressState
  } ${member.addressZipCode}`;

export const Members = (): ReactElement => {
  const { state, setFormationFormData } = useContext(FormationContext);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editIndex, setEditIndex] = useState<number | undefined>(undefined);
  const [alert, setAlert] = useState<boolean | undefined>(undefined);

  const deleteMember = (index: number) =>
    setFormationFormData({
      ...state.formationFormData,
      members: [
        ...[...state.formationFormData.members].slice(0, index),
        ...[...state.formationFormData.members].slice(index + 1),
      ],
    });
  return (
    <>
      {alert && (
        <ToastAlert variant="success" isOpen={alert !== undefined} close={() => setAlert(undefined)}>
          <div data-testid={`toast-alert-success`} className="h3-styling">
            {Config.businessFormationDefaults.membersSuccessTextHeader}
          </div>
          <div className="padding-top-05">{Config.businessFormationDefaults.membersSuccessTextBody}</div>
        </ToastAlert>
      )}
      <div className={`form-input margin-bottom-2 ${styles.membersTable}`}>
        <Content
          overrides={{
            h3: ({ children }: { children: string[] }): ReactElement => (
              <h3 style={{ display: "inline" }}>{children}</h3>
            ),
          }}
        >
          {state.displayContent.members.contentMd}
        </Content>

        <table className={`members margin-top-2 margin-bottom-3`}>
          <thead>
            <tr>
              {Config.businessFormationDefaults.membersTableColumn.split(",").map((value: string) => (
                <th className="margin-bottom-2" key={value.toLowerCase()}>
                  {value}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.formationFormData.members.length > 0 ? (
              state.formationFormData.members.map((it, index) => {
                return (
                  <tr className="margin-bottom-1" key={index}>
                    <td>{it.name}</td>
                    <td>{formatAddress(it)}</td>
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
                            deleteMember(index);
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
            {state.formationFormData.members.length === 0 ? (
              <tr>
                <td colSpan={3}>{state.displayContent.members.placeholder}</td>
              </tr>
            ) : (
              <></>
            )}
          </tfoot>
        </table>
        {state.formationFormData.members.length <= 9 && (
          <Button
            style="tertiary"
            onClick={() => {
              setEditIndex(undefined);
              setModalOpen(true);
            }}
          >
            <Icon>add</Icon>{" "}
            <span className="text-underline" style={{ textUnderlinePosition: "under" }}>
              {Config.businessFormationDefaults.membersNewButtonText}
            </span>
          </Button>
        )}
      </div>
      <MembersModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        index={editIndex}
        onSave={() => setAlert(true)}
      />
    </>
  );
};
