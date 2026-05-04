import { MgmtAuth } from "@/components/auth/MgmtAuth";
import { Heading } from "@/components/njwds-extended/Heading";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { getNextSeoTitle } from "@/lib/domain-logic/getNextSeoTitle";
import { ContentDeadLink, FoundUrl } from "@/lib/static/admin/findDeadLinks";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { LinearProgress } from "@mui/material";
import { GetServerSidePropsResult } from "next";
import { NextSeo } from "next-seo";
import { ReactElement, useCallback, useEffect, useRef, useState } from "react";

interface Props {
  noAuth: boolean;
}

type ScanStatus = {
  checkedUrls: number;
  totalUrls: number;
  isComplete: boolean;
  results: ContentDeadLink[] | null;
  error: string | null;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DeadUrlsPage = (props: Props): ReactElement => {
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const config = getMergedConfig();

  const stopPolling = useCallback((): void => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => {
    return stopPolling;
  }, [stopPolling]);

  const pollStatus = useCallback((): void => {
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/mgmt/deadlinks/status");
        if (!res.ok) return;
        const data: ScanStatus = await res.json();
        setScanStatus(data);
        if (data.isComplete) {
          stopPolling();
          setIsScanning(false);
        }
      } catch {
        // retry on next interval
      }
    }, 2500);
  }, [stopPolling]);

  const startScan = async (): Promise<void> => {
    setStartError(null);
    setIsScanning(true);
    setScanStatus(null);
    try {
      const res = await fetch("/api/mgmt/deadlinks/start", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        setStartError(data.error || "Failed to start scan");
        setIsScanning(false);
        return;
      }
      pollStatus();
    } catch {
      setStartError("Failed to start scan");
      setIsScanning(false);
    }
  };

  const escapeHtml = (str: string): string =>
    str
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");

  const generateDownloadContent = (results: ContentDeadLink[]): string => {
    const baseUrl = "https://dev.account.business.nj.gov";
    const totalDead = results.reduce((sum, r) => sum + r.deadUrls.length, 0);
    const grouped = groupByCollection(results);

    const collectionEntries = Object.entries(grouped);

    let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Dead URL Report — ${new Date().toLocaleDateString()}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 960px; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; color: #1b1b1b; }
  h1 { border-bottom: 2px solid #005ea2; padding-bottom: 0.5rem; }
  h2 { margin-top: 2rem; color: #1a4480; }
  .summary { background: #f0f0f0; padding: 1rem; border-radius: 4px; margin-bottom: 2rem; }
  .toc { margin-bottom: 2rem; }
  .toc ul { list-style: none; padding: 0; }
  .toc li { margin: 0.25rem 0; }
  .toc a { text-decoration: none; }
  .toc a:hover { text-decoration: underline; }
  .item { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #dfe1e2; border-radius: 4px; }
  .item-header { font-weight: 600; margin-bottom: 0.5rem; }
  .item-links { font-size: 0.875rem; margin-bottom: 0.75rem; }
  .item-links a { margin-right: 1rem; }
  .dead-url { margin: 0.5rem 0; padding: 0.5rem; background: #fff1f0; border-left: 3px solid #d83933; }
  .dead-url code { color: #d83933; word-break: break-all; }
  .status { color: #71767a; font-size: 0.8rem; }
  .field { font-size: 0.8rem; color: #71767a; }
  .context { font-size: 0.8rem; color: #71767a; font-style: italic; }
  a { color: #005ea2; }
</style>
</head>
<body>
<h1>Dead URL Report</h1>
<div class="summary">
  <strong>${totalDead}</strong> dead URL${totalDead === 1 ? "" : "s"} across <strong>${results.length}</strong> content item${results.length === 1 ? "" : "s"}<br>
  Generated: ${new Date().toLocaleString()}
</div>
<nav class="toc">
  <strong>Contents</strong>
  <ul>
${collectionEntries
  .map(([collection, items]) => {
    const deadCount = items.reduce((sum, r) => sum + r.deadUrls.length, 0);
    const anchor = collection.toLowerCase().replaceAll(/[^\da-z]+/g, "-");
    return `    <li><a href="#${anchor}">${escapeHtml(collection)}</a> — ${items.length} item${items.length === 1 ? "" : "s"}, ${deadCount} dead URL${deadCount === 1 ? "" : "s"}</li>`;
  })
  .join("\n")}
  </ul>
</nav>
`;

    for (const [collection, items] of collectionEntries) {
      const anchor = collection.toLowerCase().replaceAll(/[^\da-z]+/g, "-");
      html += `<h2 id="${anchor}">${escapeHtml(collection)} (${items.length})</h2>\n`;
      for (const item of items) {
        html += `<div class="item">\n`;
        html += `  <div class="item-header">${escapeHtml(item.displayName)} <span class="status">(${escapeHtml(item.slug)})</span></div>\n`;
        html += `  <div class="item-links">`;
        if (item.cmsEditUrl) {
          html += `<a href="${baseUrl}${item.cmsEditUrl}" target="_blank">Edit in CMS</a>`;
        }
        if (item.pageUrl) {
          html += `<a href="${baseUrl}${item.pageUrl}" target="_blank">View Page</a>`;
        }
        html += `</div>\n`;
        for (const deadUrl of item.deadUrls) {
          const status = deadUrl.statusCode
            ? `${deadUrl.statusCode} ${deadUrl.statusText}`
            : deadUrl.statusText || "Connection Failed";
          html += `  <div class="dead-url">`;
          html += `<code>${escapeHtml(deadUrl.url)}</code> `;
          html += `<span class="status">${escapeHtml(status)}</span><br>`;
          html += `<span class="field">Field: <strong>${escapeHtml(deadUrl.field)}</strong></span>`;
          html += ` &middot; <span class="context">${escapeHtml(deadUrl.context)}</span>`;
          html += `</div>\n`;
        }
        html += `</div>\n`;
      }
    }

    html += `</body>\n</html>`;
    return html;
  };

  const handleDownloadClick = (): void => {
    if (!scanStatus?.results) return;
    const content = generateDownloadContent(scanStatus.results);
    const blob = new Blob([content], { type: "text/html" });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "dead-urls-report.html";
    document.body.append(link);
    link.click();
    URL.revokeObjectURL(blobUrl);
    link.remove();
  };

  const progressPercent =
    scanStatus && scanStatus.totalUrls > 0
      ? Math.round((scanStatus.checkedUrls / scanStatus.totalUrls) * 100)
      : 0;

  const authedView = (
    <>
      <h1 className="margin-top-5">Dead URL Checker</h1>

      {!isScanning && !scanStatus?.isComplete && (
        <>
          <p>Scans all CMS content files for external URLs and checks if they are still alive.</p>
          <PrimaryButton onClick={startScan} isColor={"primary"}>
            Start Dead Link Check
          </PrimaryButton>
          {startError && <p className="text-error margin-top-2">{startError}</p>}
        </>
      )}

      {isScanning && scanStatus && (
        <div className="margin-top-3">
          <Heading level={2}>Scanning URLs...</Heading>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{ height: 10, borderRadius: 5 }}
          />
          <p className="margin-top-1">
            Checking URL {scanStatus.checkedUrls} of {scanStatus.totalUrls} ({progressPercent}%)
          </p>
        </div>
      )}

      {isScanning && !scanStatus && (
        <div className="margin-top-3">
          <Heading level={2}>Collecting URLs from content files...</Heading>
          <LinearProgress sx={{ height: 10, borderRadius: 5 }} />
        </div>
      )}

      {scanStatus?.error && <p className="text-error margin-top-2">Error: {scanStatus.error}</p>}

      {scanStatus?.isComplete && scanStatus.results && (
        <DeadLinkResults
          results={scanStatus.results}
          onDownload={handleDownloadClick}
          onRestart={startScan}
        />
      )}
    </>
  );

  return (
    <PageSkeleton>
      <NextSeo title={getNextSeoTitle(config.pagesMetadata.deadUrlsTitle)} noindex={true} />
      <main>
        <SingleColumnContainer>
          {isAuthed ? (
            authedView
          ) : (
            <MgmtAuth password={password} setIsAuthed={setIsAuthed} setPassword={setPassword} />
          )}
        </SingleColumnContainer>
      </main>
    </PageSkeleton>
  );
};

const groupByCollection = (results: ContentDeadLink[]): Record<string, ContentDeadLink[]> => {
  const grouped: Record<string, ContentDeadLink[]> = {};
  for (const item of results) {
    const key = item.collection || "Unknown";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  }
  return grouped;
};

const DeadLinkResults = ({
  results,
  onDownload,
  onRestart,
}: {
  results: ContentDeadLink[];
  onDownload: () => void;
  onRestart: () => void;
}): ReactElement => {
  const totalDeadUrls = results.reduce((sum, r) => sum + r.deadUrls.length, 0);
  const grouped = groupByCollection(results);

  return (
    <div className="margin-top-3">
      <Heading level={2}>
        Results: {totalDeadUrls} dead URL{totalDeadUrls === 1 ? "" : "s"} across {results.length}{" "}
        content item{results.length === 1 ? "" : "s"}
      </Heading>

      <div className="margin-bottom-3">
        <span className="margin-right-2">
          <PrimaryButton onClick={onDownload} isColor={"primary"}>
            Download Report
          </PrimaryButton>
        </span>
        <PrimaryButton onClick={onRestart} isColor={"secondary"}>
          Run Again
        </PrimaryButton>
      </div>

      {Object.entries(grouped).map(([collection, items]) => (
        <div key={collection} className="margin-top-4">
          <Heading level={3}>
            {collection} ({items.length})
          </Heading>
          <ul>
            {items.map((item) => (
              <li key={item.file} className="margin-bottom-3">
                <div>
                  <strong>{item.displayName}</strong>{" "}
                  <span className="text-base">({item.slug})</span>
                </div>
                <div className="font-body-2xs margin-top-05">
                  {item.cmsEditUrl && (
                    <a
                      href={item.cmsEditUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="margin-right-2"
                    >
                      Edit in CMS
                    </a>
                  )}
                  {item.pageUrl && (
                    <a href={item.pageUrl} target="_blank" rel="noreferrer">
                      View Page
                    </a>
                  )}
                </div>
                <ul className="margin-top-05">
                  {item.deadUrls.map((deadUrl: FoundUrl, i: number) => (
                    <li key={i} className="margin-bottom-1">
                      <div>
                        <code className="text-error">{deadUrl.url}</code>{" "}
                        <span className="text-base font-body-2xs">
                          —{" "}
                          {deadUrl.statusCode
                            ? `${deadUrl.statusCode} ${deadUrl.statusText}`
                            : deadUrl.statusText || "Connection Failed"}
                        </span>
                      </div>
                      <div className="text-base font-body-2xs">
                        Field: <strong>{deadUrl.field}</strong>
                        {" · "}
                        {deadUrl.context}
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export const getServerSideProps = async (): Promise<GetServerSidePropsResult<Props>> => {
  const isEnabled =
    (process.env.CHECK_DEAD_LINKS && process.env.CHECK_DEAD_LINKS === "true") || false;
  return isEnabled ? { props: { noAuth: true } } : { notFound: true };
};

export default DeadUrlsPage;
