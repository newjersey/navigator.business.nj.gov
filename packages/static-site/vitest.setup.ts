import { cleanup } from "@testing-library/react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { createElement } from "react";
import { afterEach, vi } from "vitest";

/**
 * Props accepted by the mocked navigation link.
 */
interface MockLocalizedLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Href rendered on the anchor element. */
  readonly href: string;
  /** Child nodes rendered inside the anchor element. */
  readonly children?: ReactNode;
}

/**
 * Minimal anchor implementation for next-intl navigation testing.
 */
const MockLocalizedLink = ({ href, children, ...anchorProps }: MockLocalizedLinkProps) => {
  return createElement("a", { href, ...anchorProps }, children);
};

/**
 * Creates a mock next-intl navigation API for component tests.
 */
const createNavigationMock = () => {
  return {
    Link: MockLocalizedLink,
    redirect: vi.fn(),
    usePathname: vi.fn(),
    useRouter: vi.fn(),
    getPathname: vi.fn(),
  };
};

vi.mock("next-intl/navigation", () => {
  return { createNavigation: createNavigationMock };
});

/**
 * Unmounts components after every test run.
 */
const runCleanup = (): void => {
  cleanup();
};

afterEach(runCleanup);
