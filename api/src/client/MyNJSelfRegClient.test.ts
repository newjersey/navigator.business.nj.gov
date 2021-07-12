import axios from "axios";
import { SelfRegClient } from "../domain/types";
import { MyNJSelfRegClientFactory } from "./MyNJSelfRegClient";
import { generateUser } from "../domain/factories";
import * as https from "https";

jest.mock("axios");

describe("MyNJSelfRegClient", () => {
  let mockedAxios: jest.Mock;
  let client: SelfRegClient;
  const httpsAgent = new https.Agent({
    cert: "some-cert-string",
    key: "some-key-string",
  });

  const config = {
    serviceToken: "some-service-token",
    roleName: "some-role-name",
    serviceUrl: "some-service-url",
    httpsAgent: httpsAgent,
  };

  beforeEach(() => {
    jest.resetAllMocks();
    mockedAxios = axios as unknown as jest.Mock;
    client = MyNJSelfRegClientFactory(config);
    mockedAxios.mockRejectedValue({});
  });

  it("calls grant with SOAP body", async () => {
    const user = generateUser({});
    await client.grant(user);

    const expectedBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:my="http://my.state.nj.us/">\
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

    expect(mockedAxios).toHaveBeenCalledWith({
      method: "post",
      url: config.serviceUrl,
      data: expectedBody,
      headers: { "Content-Type": "text/xml;encoding=UTF-8" },
      httpsAgent: httpsAgent,
    });
  });

  it("calls resume with SOAP body", async () => {
    await client.resume("some-mynj-key");

    const expectedBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:my="http://my.state.nj.us/">\
            <soapenv:Header/>\
            <soapenv:Body>\
              <my:resume>\
                  <authID>some-mynj-key</authID>\
                  <serviceToken>${config.serviceToken}</serviceToken>\
              </my:resume>\
            </soapenv:Body>\
          </soapenv:Envelope>`;

    expect(mockedAxios).toHaveBeenCalledWith({
      method: "post",
      url: config.serviceUrl,
      data: expectedBody,
      headers: { "Content-Type": "text/xml;encoding=UTF-8" },
      httpsAgent: httpsAgent,
    });
  });

  it("returns the redirect URL and auth key for grant success", async () => {
    mockedAxios.mockResolvedValue({ data: grantSuccessReponse });
    const selfRegResponse = await client.grant(generateUser({}));
    expect(selfRegResponse).toEqual({
      authRedirectURL: "https://myt1.state.nj.us/signup/SignupLinked?oid=some-grant-stuff-here",
      myNJUserKey: "123456",
    });
  });

  it("returns the redirect URL and auth key for resume success", async () => {
    mockedAxios.mockResolvedValue({ data: resumeSuccessResponse });
    const selfRegResponse = await client.resume("some-id");
    expect(selfRegResponse).toEqual({
      authRedirectURL: "https://myt1.state.nj.us/signup/SignupLinked?oid=some-resume-stuff-here",
      myNJUserKey: "",
    });
  });
});

const grantSuccessReponse =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/">\n' +
  "    <S:Body>\n" +
  '        <ns2:grantResponse xmlns:ns2="http://my.state.nj.us/">\n' +
  "            <return>\n" +
  "                <Success>true</Success>\n" +
  "                <AuthID>123456</AuthID>\n" +
  "                <AuthURL>https://myt1.state.nj.us/signup/SignupLinked?oid=some-grant-stuff-here</AuthURL>\n" +
  "            </return>\n" +
  "        </ns2:grantResponse>\n" +
  "    </S:Body>\n" +
  "</S:Envelope>";

const resumeSuccessResponse =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/">\n' +
  "    <S:Body>\n" +
  '        <ns2:resumeResponse xmlns:ns2="http://my.state.nj.us/">\n' +
  "            <return>\n" +
  "                <Success>true</Success>\n" +
  "                <AuthID/>\n" +
  "                <AuthURL>https://myt1.state.nj.us/signup/SignupLinked?oid=some-resume-stuff-here</AuthURL>\n" +
  "            </return>\n" +
  "        </ns2:resumeResponse>\n" +
  "    </S:Body>\n" +
  "</S:Envelope>";
