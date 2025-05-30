import { SelfRegClient, SelfRegResponse } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import { BusinessUser } from "@shared/businessUser";
import axios from "axios";
import xml2js from "xml2js";

type MyNJConfig = {
  serviceToken: string;
  roleName: string;
  serviceUrl: string;
};

export const MyNJSelfRegClientFactory = (
  config: MyNJConfig,
  logger: LogWriterType,
): SelfRegClient => {
  const logId = logger.GetId();
  const resume = (myNJUserKey: string): Promise<SelfRegResponse> => {
    return makeRequest(createResumeBody(myNJUserKey), "RESUME");
  };

  const grant = (user: BusinessUser): Promise<SelfRegResponse> => {
    return makeRequest(createGrantBody(user), "GRANT");
  };

  const makeRequest = async (body: string, type: "GRANT" | "RESUME"): Promise<SelfRegResponse> => {
    const headers = {
      "Content-Type": "text/xml;encoding=UTF-8",
    };

    logger.LogInfo(
      `myNJ Self-Reg - Id:${logId} - Request Sent to ${config.serviceUrl} data: ${JSON.stringify(
        body,
      )} headers: ${JSON.stringify(headers)}`,
    );

    return axios({
      method: "post",
      url: config.serviceUrl,
      data: body,
      headers: headers,
    })
      .then(async (xmlResponse) => {
        const response = await xml2js.parseStringPromise(xmlResponse.data);
        if (process.env.NODE_ENV !== "test") {
          console.log("response", response);
        }
        const xmlResponseName = type === "GRANT" ? "ns2:grantResponse" : "ns2:resumeResponse";
        const xmlResponseObj = response["S:Envelope"]["S:Body"][0][xmlResponseName][0]["return"][0];

        const success = xmlResponseObj["Success"];
        const authId = xmlResponseObj["AuthID"];
        const authURL = xmlResponseObj["AuthURL"];
        const errors = xmlResponseObj["Errors"];

        if (!success || success[0] !== "true") {
          logger.LogError(
            `myNJ Self-Reg - Id:${logId} - Error Response Received. Data: Success: ${success} AuthId: ${authId}. Errors: ${errors}`,
          );
          throw errors;
        } else {
          logger.LogInfo(
            `myNJ Self-Reg - Id:${logId} - Response Received. Data: Success: ${success} AuthId: ${authId}. Errors: ${errors}`,
          );
        }

        return {
          authRedirectURL: authURL[0],
          myNJUserKey: authId[0],
        };
      })
      .catch((error) => {
        logger.LogError(`myNJ Self-Reg - Id:${logId} - myNJSelfRegError: `, error);
        const myNJDuplicateErrors = ["E1048", "E1017", "E1059", "E2109"];
        if (error.length > 0 && myNJDuplicateErrors.includes(error[0].split(" ")[0])) {
          throw new Error("DUPLICATE_SIGNUP");
        }

        return error;
      });
  };

  const createResumeBody = (myNJUserKey: string): string => {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:my="http://my.state.nj.us/">\
            <soapenv:Header/>\
            <soapenv:Body>\
              <my:resume>\
                  <authID>${myNJUserKey}</authID>\
                  <serviceToken>${config.serviceToken}</serviceToken>\
              </my:resume>\
            </soapenv:Body>\
          </soapenv:Envelope>`;
  };

  const createGrantBody = (user: BusinessUser): string => {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:my="http://my.state.nj.us/">\
          <soapenv:Header/>\
          <soapenv:Body>\
            <my:grant>\
                <roleName>${config.roleName}</roleName>\
                <businessName>${user.name}</businessName>\
                <contactName>${user.name}</contactName>\
                <email>${user.email}</email>\
                <userKey>${user.id}</userKey>\
                <reGrantRevoked>false</reGrantRevoked>\
                <serviceToken>${config.serviceToken}</serviceToken>\
            </my:grant>\
          </soapenv:Body>\
          </soapenv:Envelope>`;
  };

  return {
    grant,
    resume,
  };
};
