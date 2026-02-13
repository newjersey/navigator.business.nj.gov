import { describe, it, expect, vi } from "vitest";
import path from "path";
import matter from "gray-matter";
import fs from "fs";
import {
  type FileSystemPort,
  type BuildConfig,
  createFileSystemPort,
  isJsonFile,
  parseIndustryFile,
  buildIndustries,
  buildAndWriteIndustries,
  buildSectors,
  buildAndWriteSectors,
  buildAndWriteContent,
  contentConfigs,
  executeBuild,
  createBuildConfig,
  logBuildResults,
  main,
} from "./build";

// ============================================================================
// TEST UTILITIES - Mock Ports
// ============================================================================

interface MockFileSystemConfig {
  directories?: Record<string, string[]>;
  files?: Record<string, string>;
  existingDirs?: Set<string>;
}

interface MockFileSystem extends FileSystemPort {
  directoryExists: (dirPath: string) => boolean;
}

const createMockFileSystem = (config: MockFileSystemConfig = {}): MockFileSystem => {
  const {
    directories = {},
    files = {},
    existingDirs = new Set<string>(),
  } = config;

  return {
    readDirectory: (dirPath: string) => directories[dirPath] || [],
    readFile: (filePath: string) => files[filePath] || "",
    writeJsonFile: (filePath: string, data: unknown) => {
      files[filePath] = JSON.stringify(data);
    },
    writePrettyJsonFile: (filePath: string, data: unknown) => {
      files[filePath] = JSON.stringify(data, null, 2);
    },
    directoryExists: (dirPath: string) => existingDirs.has(dirPath) || directories[dirPath] !== undefined,
  };
};

interface MarkdownParser {
  parse: (content: string) => { data: Record<string, unknown>; content: string };
}

const createMockMarkdown = (): MarkdownParser => ({
  parse: (content: string) => matter(content),
});

// ============================================================================
// INFRASTRUCTURE LAYER TESTS
// ============================================================================

describe("Infrastructure Layer", () => {
  describe("File System Port", () => {
    it("should check if directory exists", () => {
      const mockFs = createMockFileSystem({
        existingDirs: new Set(["/test/dir"]),
      });

      expect(mockFs.directoryExists("/test/dir")).toBe(true);
      expect(mockFs.directoryExists("/other/dir")).toBe(false);
    });

    it("should read directory contents", () => {
      const mockFs = createMockFileSystem({
        directories: {
          "/test": ["file1.json", "file2.json"],
        },
      });

      const files = mockFs.readDirectory("/test");
      expect(files).toEqual(["file1.json", "file2.json"]);
    });

    it("should read file contents", () => {
      const mockFs = createMockFileSystem({
        files: {
          "/test/file.txt": "test content",
        },
      });

      const content = mockFs.readFile("/test/file.txt");
      expect(content).toBe("test content");
    });

    it("should write JSON file", () => {
      const files: Record<string, string> = {};
      const mockFs = createMockFileSystem({ files });

      mockFs.writeJsonFile("/output/data.json", { test: "data" });

      expect(files["/output/data.json"]).toBe('{"test":"data"}');
    });

    it("should write pretty-printed JSON file", () => {
      const files: Record<string, string> = {};
      const mockFs = createMockFileSystem({ files });

      mockFs.writePrettyJsonFile("/output/data.pretty.json", { test: "data", nested: { value: 123 } });

      const expected = JSON.stringify({ test: "data", nested: { value: 123 } }, null, 2);
      expect(files["/output/data.pretty.json"]).toBe(expected);
    });
  });

  describe("Markdown Parser Port", () => {
    it("should parse markdown with frontmatter", () => {
      const markdown = createMockMarkdown();
      const content = `---
title: Test Title
id: test-id
---
# Content

This is test content.`;

      const result = markdown.parse(content);

      expect(result.data.title).toBe("Test Title");
      expect(result.data.id).toBe("test-id");
      expect(result.content).toContain("# Content");
    });
  });
});

// ============================================================================
// DOMAIN LAYER TESTS
// ============================================================================

describe("Domain Layer", () => {
  describe("Predicate Functions", () => {
    it("isJsonFile should identify JSON files", () => {
      expect(isJsonFile("test.json")).toBe(true);
      expect(isJsonFile("test.JSON")).toBe(false);
      expect(isJsonFile("test.md")).toBe(false);
      expect(isJsonFile("test.txt")).toBe(false);
    });
  });

  describe("Industry Builder", () => {
    it("should parse industry JSON file", () => {
      const mockFs = createMockFileSystem({
        files: {
          "/industries/test.json": JSON.stringify({
            id: "test-industry",
            name: "Test Industry",
            naicsCodes: "123456",
          }),
        },
      });

      const industry = parseIndustryFile(mockFs, "/industries", "test.json") as Record<string, unknown>;

      expect(industry.id).toBe("test-industry");
      expect(industry.name).toBe("Test Industry");
      expect(industry.naicsCodes).toBe("123456");
    });

    it("should build industries from directory", () => {
      const mockFs = createMockFileSystem({
        directories: {
          "/industries": ["industry1.json", "industry2.json", "readme.md"],
        },
        files: {
          "/industries/industry1.json": JSON.stringify({ id: "ind1", name: "Industry 1" }),
          "/industries/industry2.json": JSON.stringify({ id: "ind2", name: "Industry 2" }),
        },
      });

      const industries = buildIndustries(mockFs, "/industries") as Array<Record<string, unknown>>;

      expect(industries).toHaveLength(2);
      expect(industries[0].id).toBe("ind1");
      expect(industries[1].id).toBe("ind2");
    });

    it("should handle empty directory", () => {
      const mockFs = createMockFileSystem({
        directories: { "/industries": [] },
      });

      const industries = buildIndustries(mockFs, "/industries");
      expect(industries).toHaveLength(0);
    });
  });

  describe("Sector Builder", () => {
    it("should enrich sectors with matching industries", () => {
      const sectors = [
        { id: "construction", name: "Construction", nonEssentialQuestionsIds: [] },
        { id: "cannabis", name: "Cannabis", nonEssentialQuestionsIds: [] },
      ];

      const industries = [
        { id: "commercial-construction", name: "Construction", naicsCodes: "236220, 238160", defaultSectorId: "construction" },
        { id: "home-contractor", name: "Home Improvement Contractor", naicsCodes: "236118", defaultSectorId: "construction" },
        { id: "cannabis", name: "Cannabis", naicsCodes: "111419, 111998, 424590, 459991", defaultSectorId: "cannabis" },
      ];

      const enrichedSectors = buildSectors(sectors, industries);

      expect(enrichedSectors).toHaveLength(2);
      expect(enrichedSectors[0].id).toBe("construction");
      expect(enrichedSectors[0].industries).toHaveLength(2);
      expect(enrichedSectors[0].industries[0].id).toBe("commercial-construction");
      expect(enrichedSectors[0].industries[0].naicsCodes).toBe("236220, 238160");
      expect(enrichedSectors[0].industries[1].id).toBe("home-contractor");

      expect(enrichedSectors[1].id).toBe("cannabis");
      expect(enrichedSectors[1].industries).toHaveLength(1);
      expect(enrichedSectors[1].industries[0].id).toBe("cannabis");
      expect(enrichedSectors[1].industries[0].naicsCodes).toBe("111419, 111998, 424590, 459991");
    });

    it("should return empty industries array for sectors with no matches", () => {
      const sectors = [
        { id: "technology", name: "Technology", nonEssentialQuestionsIds: [] },
      ];

      const industries = [
        { id: "cannabis", name: "Cannabis", naicsCodes: "111419", defaultSectorId: "cannabis" },
      ];

      const enrichedSectors = buildSectors(sectors, industries);

      expect(enrichedSectors).toHaveLength(1);
      expect(enrichedSectors[0].industries).toHaveLength(0);
    });

    it("should handle industries without naicsCodes", () => {
      const sectors = [
        { id: "generic", name: "Generic", nonEssentialQuestionsIds: [] },
      ];

      const industries = [
        { id: "generic-industry", name: "Generic Industry", defaultSectorId: "generic" },
      ];

      const enrichedSectors = buildSectors(sectors, industries);

      expect(enrichedSectors).toHaveLength(1);
      expect(enrichedSectors[0].industries).toHaveLength(1);
      expect(enrichedSectors[0].industries[0].id).toBe("generic-industry");
      expect(enrichedSectors[0].industries[0].naicsCodes).toBeUndefined();
    });

    it("should preserve original sector fields like nonEssentialQuestionsIds", () => {
      const sectors = [
        { id: "test", name: "Test", nonEssentialQuestionsIds: ["question1", "question2"] },
      ];

      const industries = [
        { id: "test-industry", name: "Test Industry", naicsCodes: "123", defaultSectorId: "test" },
      ];

      const enrichedSectors = buildSectors(sectors, industries);

      expect(enrichedSectors[0].nonEssentialQuestionsIds).toEqual(["question1", "question2"]);
    });
  });
});

// ============================================================================
// APPLICATION LAYER TESTS
// ============================================================================

describe("Application Layer", () => {
  describe("Build Orchestration", () => {
    it("should build and write industries with both regular and pretty JSON", () => {
      const files: Record<string, string> = {};
      const mockFs = createMockFileSystem({
        directories: {
          "/root/src/roadmaps/industries": ["industry.json"],
        },
        files: {
          "/root/src/roadmaps/industries/industry.json": JSON.stringify({
            id: "test",
            name: "Test",
          }),
          ...files,
        },
      });

      const config: BuildConfig = {
        rootDir: "/root",
        outputDir: "/root/lib",
      };

      const industries = buildAndWriteIndustries(mockFs, config);

      expect(industries).toHaveLength(1);

      // Verify minified JSON
      const minifiedOutput = mockFs.readFile(path.join(config.outputDir, "industry.json"));
      expect(minifiedOutput).toContain("test");
      expect(minifiedOutput).not.toContain("\n  "); // No pretty indentation

      // Verify pretty JSON
      const prettyOutput = mockFs.readFile(path.join(config.outputDir, "industry.pretty.json"));
      expect(prettyOutput).toContain("test");
      expect(prettyOutput).toContain("\n  "); // Has pretty indentation
    });

    it("should build and write content with generic helper", () => {
      const files: Record<string, string> = {};
      const mockFs = createMockFileSystem({ files });

      const config: BuildConfig = {
        rootDir: "/root",
        outputDir: "/root/lib",
      };

      const mockData = [{ id: "1", name: "Item 1" }, { id: "2", name: "Item 2" }];
      const loader = () => mockData;

      const result = buildAndWriteContent(mockFs, config, loader, "test-content", "items");

      expect(result).toEqual(mockData);
      expect(result).toHaveLength(2);

      // Verify minified JSON was written
      const minifiedOutput = JSON.parse(mockFs.readFile("/root/lib/test-content.json"));
      expect(minifiedOutput.items).toHaveLength(2);
      expect(minifiedOutput.items[0].name).toBe("Item 1");

      // Verify pretty JSON was written
      const prettyOutput = JSON.parse(mockFs.readFile("/root/lib/test-content.pretty.json"));
      expect(prettyOutput.items).toHaveLength(2);
      expect(prettyOutput.items[1].name).toBe("Item 2");
    });

    it("should build and write sectors with both regular and pretty JSON", () => {
      const files: Record<string, string> = {
        "/root/src/mappings/sectors.json": JSON.stringify({
          arrayOfSectors: [
            { id: "construction", name: "Construction", nonEssentialQuestionsIds: [] },
            { id: "cannabis", name: "Cannabis", nonEssentialQuestionsIds: [] },
          ],
        }),
      };
      const mockFs = createMockFileSystem({ files });

      const config: BuildConfig = {
        rootDir: "/root",
        outputDir: "/root/lib",
      };

      const industries = [
        { id: "commercial-construction", name: "Construction", naicsCodes: "236220", defaultSectorId: "construction" },
        { id: "cannabis", name: "Cannabis", naicsCodes: "111419, 111998, 424590, 459991", defaultSectorId: "cannabis" },
      ];

      const sectors = buildAndWriteSectors(mockFs, config, industries);

      expect(sectors).toHaveLength(2);
      expect(sectors[0].industries).toHaveLength(1);
      expect(sectors[1].industries).toHaveLength(1);

      // Verify minified JSON
      const minifiedOutput = JSON.parse(mockFs.readFile("/root/lib/sectors.json"));
      expect(minifiedOutput.sectors).toHaveLength(2);
      expect(minifiedOutput.sectors[0].id).toBe("construction");
      expect(minifiedOutput.sectors[0].industries[0].naicsCodes).toBe("236220");

      // Verify pretty JSON
      const prettyOutput = JSON.parse(mockFs.readFile("/root/lib/sectors.pretty.json"));
      expect(prettyOutput.sectors).toHaveLength(2);
      expect(prettyOutput.sectors[1].industries[0].id).toBe("cannabis");
    });

    it("should handle sectors with correct industry children", () => {
      const files: Record<string, string> = {
        "/root/src/mappings/sectors.json": JSON.stringify({
          arrayOfSectors: [
            { id: "construction", name: "Construction", nonEssentialQuestionsIds: [] },
          ],
        }),
      };
      const mockFs = createMockFileSystem({ files });

      const config: BuildConfig = {
        rootDir: "/root",
        outputDir: "/root/lib",
      };

      const industries = [
        { id: "commercial-construction", name: "Construction", naicsCodes: "236220", defaultSectorId: "construction" },
        { id: "home-contractor", name: "Home Improvement Contractor", naicsCodes: "236118", defaultSectorId: "construction" },
        { id: "cannabis", name: "Cannabis", naicsCodes: "111419", defaultSectorId: "cannabis" },
      ];

      const sectors = buildAndWriteSectors(mockFs, config, industries);

      expect(sectors).toHaveLength(1);
      expect(sectors[0].industries).toHaveLength(2);
      expect(sectors[0].industries[0].id).toBe("commercial-construction");
      expect(sectors[0].industries[1].id).toBe("home-contractor");
    });

    it("should execute full build and return statistics", () => {
      const files: Record<string, string> = {
        "/root/src/mappings/sectors.json": JSON.stringify({
          arrayOfSectors: [
            { id: "construction", name: "Construction", nonEssentialQuestionsIds: [] },
            { id: "cannabis", name: "Cannabis", nonEssentialQuestionsIds: [] },
          ],
        }),
      };
      const mockFs = createMockFileSystem({
        directories: {
          "/root/src/roadmaps/industries": ["ind1.json", "ind2.json"],
        },
        files: {
          "/root/src/roadmaps/industries/ind1.json": JSON.stringify({ id: "ind1", defaultSectorId: "construction" }),
          "/root/src/roadmaps/industries/ind2.json": JSON.stringify({ id: "ind2", defaultSectorId: "cannabis" }),
          ...files,
        },
      });

      const config: BuildConfig = {
        rootDir: "/root",
        outputDir: "/root/lib",
      };

      const result = executeBuild(mockFs, config);

      expect(result.industriesCount).toBe(2);
      expect(result.sectorsCount).toBe(2);
      expect(result.tasksCount).toBeGreaterThan(0);
      expect(result.actionsCount).toBeGreaterThan(0);
      expect(result.certificationsCount).toBeGreaterThan(0);
      expect(result.filingsCount).toBeGreaterThan(0);
      expect(result.fundingsCount).toBeGreaterThan(0);
      expect(result.licenseCalendarEventsCount).toBeGreaterThan(0);
      expect(result.licenseReinstatementsCount).toBeGreaterThan(0);
    });
  });

  describe("Build Configuration", () => {
    it("should create build config from current directory", () => {
      const config = createBuildConfig();

      expect(config.rootDir).toBeTruthy();
      expect(config.outputDir).toBeTruthy();
      expect(config.outputDir).toContain("lib");
    });

    it("should log build results to console", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const result = {
        industriesCount: 10,
        sectorsCount: 25,
        tasksCount: 20,
        actionsCount: 30,
        certificationsCount: 5,
        filingsCount: 15,
        fundingsCount: 25,
        licenseCalendarEventsCount: 8,
        licenseReinstatementsCount: 12,
      };

      logBuildResults(result);

      expect(consoleSpy).toHaveBeenCalledWith("✓ Built industry.json with 10 industries");
      expect(consoleSpy).toHaveBeenCalledWith("✓ Built sectors.json with 25 sectors");
      expect(consoleSpy).toHaveBeenCalledWith("✓ Built tasks.json with 20 tasks");
      expect(consoleSpy).toHaveBeenCalledWith("✓ Built actions.json with 30 anytime actions");
      expect(consoleSpy).toHaveBeenCalledWith("✓ Built certifications.json with 5 certifications");
      expect(consoleSpy).toHaveBeenCalledWith("✓ Built filings.json with 15 filings");
      expect(consoleSpy).toHaveBeenCalledWith("✓ Built fundings.json with 25 fundings");
      expect(consoleSpy).toHaveBeenCalledWith(
        "✓ Built license-calendar-events.json with 8 license-related calendar events",
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "✓ Built license-reinstatements.json with 12 license reinstatements",
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Content Configuration", () => {
    it("should have configuration for all content types", () => {
      expect(contentConfigs).toHaveLength(7); // 7 content types (excluding industries)

      const fileNames = contentConfigs.map((c) => c.outputFileName);
      expect(fileNames).toContain("tasks");
      expect(fileNames).toContain("actions");
      expect(fileNames).toContain("certifications");
      expect(fileNames).toContain("filings");
      expect(fileNames).toContain("fundings");
      expect(fileNames).toContain("license-calendar-events");
      expect(fileNames).toContain("license-reinstatements");
    });

    it("should have valid loader functions", () => {
      for (const config of contentConfigs) {
        expect(typeof config.loader).toBe("function");
        const result = config.loader();
        expect(Array.isArray(result)).toBe(true);
      }
    });

    it("should have matching result keys", () => {
      const expectedKeys = [
        "tasksCount",
        "actionsCount",
        "certificationsCount",
        "filingsCount",
        "fundingsCount",
        "licenseCalendarEventsCount",
        "licenseReinstatementsCount",
      ];

      const resultKeys = contentConfigs.map((c) => c.resultKey);
      expect(resultKeys).toEqual(expectedKeys);
    });
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe("Integration Tests", () => {
  it("should build industries correctly", () => {
    const files: Record<string, string> = {};
    const mockFs = createMockFileSystem({
      directories: {
        "/root/src/roadmaps/industries": ["ind1.json", "ind2.json"],
      },
      files: {
        "/root/src/roadmaps/industries/ind1.json": JSON.stringify({ id: "ind1" }),
        "/root/src/roadmaps/industries/ind2.json": JSON.stringify({ id: "ind2" }),
        ...files,
      },
    });

    const config: BuildConfig = {
      rootDir: "/root",
      outputDir: "/root/lib",
    };

    // Build industries
    const industries = buildAndWriteIndustries(mockFs, config);

    // Verify industries were built correctly
    expect(industries).toHaveLength(2);

    // Verify JSON file was written correctly
    const industryOutput = JSON.parse(mockFs.readFile("/root/lib/industry.json")) as { industries: unknown[] };
    expect(industryOutput.industries).toHaveLength(2);
  });

  it("should create real file system port", () => {
    // Test that the real factory function works
    const fileSystem = createFileSystemPort();

    expect(fileSystem).toBeDefined();
    expect(typeof fileSystem.readDirectory).toBe("function");
    expect(typeof fileSystem.readFile).toBe("function");
    expect(typeof fileSystem.writeJsonFile).toBe("function");
    expect(typeof fileSystem.writePrettyJsonFile).toBe("function");
  });

  it("should write JSON files using real file system", () => {
    const fileSystem = createFileSystemPort();
    const testDir = "/tmp/build-test";
    const testFile = path.join(testDir, "nested", "test.json");
    const testData = { test: "data", items: [1, 2, 3] };

    // Clean up if exists
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }

    // Write file (should create directory automatically)
    fileSystem.writeJsonFile(testFile, testData);

    // Verify file was written
    expect(fs.existsSync(testFile)).toBe(true);
    const written = JSON.parse(fs.readFileSync(testFile, "utf8"));
    expect(written).toEqual(testData);

    // Clean up
    fs.rmSync(testDir, { recursive: true });
  });

  it("should write pretty JSON files using real file system", () => {
    const fileSystem = createFileSystemPort();
    const testDir = "/tmp/build-test-pretty";
    const testFile = path.join(testDir, "test.pretty.json");
    const testData = { test: "data", items: [1, 2, 3] };

    // Clean up if exists
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }

    // Write file
    fileSystem.writePrettyJsonFile(testFile, testData);

    // Verify file was written with pretty formatting
    expect(fs.existsSync(testFile)).toBe(true);
    const content = fs.readFileSync(testFile, "utf8");
    expect(content).toContain("\n  "); // Has indentation
    const written = JSON.parse(content);
    expect(written).toEqual(testData);

    // Clean up
    fs.rmSync(testDir, { recursive: true });
  });

  it("should execute main function successfully", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    // Run main - this executes the full build
    main();

    // Verify console output was logged
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("✓ Built industry.json"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("✓ Built sectors.json"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("✓ Built tasks.json"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("✓ Built actions.json"));

    // Verify output files exist
    expect(fs.existsSync("lib/industry.json")).toBe(true);
    expect(fs.existsSync("lib/industry.pretty.json")).toBe(true);
    expect(fs.existsSync("lib/sectors.json")).toBe(true);
    expect(fs.existsSync("lib/sectors.pretty.json")).toBe(true);
    expect(fs.existsSync("lib/tasks.json")).toBe(true);

    consoleSpy.mockRestore();
  });
});
