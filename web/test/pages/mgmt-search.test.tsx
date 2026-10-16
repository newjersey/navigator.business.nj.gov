import * as api from "@/lib/api-client/apiClient";
import SearchContentPage from "@/pages/mgmt/search";
import { generateFormationDbaContent, generateXrayRenewalCalendarEvent } from "@/test/factories";
import { ConfigContext, ConfigType, getMergedConfig } from "@businessnjgovnavigator/shared";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@/lib/api-client/apiClient", () => ({ post: jest.fn() }));
const mockApi = api as jest.Mocked<typeof api>;

// searchConfig walks Config.default, which webpack's JSON namespace imports provide but Jest's do not.
const configWithSearchableDefault = {
  ...getMergedConfig(),
  default: { footer: { title: "zyxwvut hours" } },
} as ConfigType;

const renderSearchPage = (cmsConfig: { collections: [] }): void => {
  render(
    <ConfigContext.Provider value={{ config: configWithSearchableDefault, setOverrides: () => {} }}>
      <SearchContentPage
        netlifyConfig={{}}
        noAuth={true}
        tasks={[]}
        licenseTasks={[]}
        municipalTasks={[]}
        envTasks={[]}
        raffleBingoSteps={[]}
        certifications={[]}
        archivedCertifications={[]}
        fundings={[]}
        webflowLicenses={[]}
        filings={[]}
        roadmapDisplayContent={{ sidebarDisplayContent: {} }}
        contextualInfo={[]}
        archivedContextualInfo={[]}
        licenseCalendarEvents={[]}
        xrayRenewalCalendarEvent={generateXrayRenewalCalendarEvent({})}
        anytimeActionTasks={[]}
        anytimeActionLicenseReinstatements={[]}
        pageMetaData={[]}
        cmsConfig={cmsConfig}
        formationDbaContent={{ formationDbaContent: generateFormationDbaContent({}) }}
        addOns={[]}
        industries={[]}
        categories={[]}
        covids={[]}
        faqs={[]}
        pages={[]}
        recents={[]}
        tropicalStormIda={[]}
      />
    </ConfigContext.Provider>,
  );
};

describe("mgmt search page", () => {
  it("shows the config search error message when a config key has no CMS file", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockApi.post.mockResolvedValue({});
    renderSearchPage({ collections: [] });

    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "ADMIN_PASSWORD" } });
    fireEvent.click(screen.getByText("Submit"));
    fireEvent.change(await screen.findByLabelText("Search Exact Text"), {
      target: { value: "zyxwvut" },
    });
    fireEvent.click(screen.getByText("Submit"));

    expect(await screen.findByText("DID NOT FIND CMS FILE FOR footer")).toBeInTheDocument();
    expect(console.error).toHaveBeenCalledTimes(1);
  });
});
