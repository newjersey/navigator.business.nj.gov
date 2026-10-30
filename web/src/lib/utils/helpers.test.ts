import { renderHook } from "@testing-library/react";
import { flattenObject, useMountEffectWhenDefined } from "@/lib/utils/helpers";

describe("useMountEffectWhenDefined", () => {
  interface Props {
    value: string | undefined | (string | undefined)[];
  }

  it("calls function just once after single dependency becomes defined", () => {
    const mockFn = jest.fn();
    const { rerender } = renderHook(
      (props: Props) => {
        useMountEffectWhenDefined(mockFn, props.value);
      },
      {
        initialProps: { value: undefined } as Props,
      },
    );

    expect(mockFn).not.toHaveBeenCalled();

    rerender({ value: "defined" });
    expect(mockFn).toHaveBeenCalledTimes(1);

    rerender({ value: "changed" });
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("calls function just once when single dependency is defined from the beginning", () => {
    const mockFn = jest.fn();
    const { rerender } = renderHook(
      (props: Props) => {
        useMountEffectWhenDefined(mockFn, props.value);
      },
      {
        initialProps: { value: "defined" } as Props,
      },
    );

    expect(mockFn).toHaveBeenCalled();

    rerender({ value: "defined" });
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("calls function just once after all array dependencies become defined", () => {
    const mockFn = jest.fn();
    const { rerender } = renderHook(
      (props: Props) => useMountEffectWhenDefined(mockFn, props.value),
      {
        initialProps: { value: [undefined, undefined] } as Props,
      },
    );

    expect(mockFn).not.toHaveBeenCalled();

    rerender({ value: ["defined", undefined] });
    expect(mockFn).not.toHaveBeenCalled();

    rerender({ value: ["defined", "defined"] });
    expect(mockFn).toHaveBeenCalledTimes(1);

    rerender({ value: ["changed", "changed"] });
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});

describe("flattenObject", () => {
  it("lifts nested object keys to the top level", () => {
    expect(flattenObject({ a: 1, b: { c: 2, d: { e: 3 } } })).toEqual({ a: 1, c: 2, e: 3 });
  });

  it("keeps arrays and null as values", () => {
    expect(flattenObject({ list: [1, { x: 2 }], empty: null })).toEqual({
      list: [1, { x: 2 }],
      empty: null,
    });
  });

  it("lets a later key overwrite an earlier one with the same name", () => {
    expect(flattenObject({ label: "outer", nested: { label: "inner" } })).toEqual({
      label: "inner",
    });
  });
});
