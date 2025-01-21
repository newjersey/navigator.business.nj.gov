import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { renderHook } from "@testing-library/react";

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
      }
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
      }
    );

    expect(mockFn).toHaveBeenCalled();

    rerender({ value: "defined" });
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("calls function just once after all array dependencies become defined", () => {
    const mockFn = jest.fn();
    const { rerender } = renderHook((props: Props) => useMountEffectWhenDefined(mockFn, props.value), {
      initialProps: { value: [undefined, undefined] } as Props,
    });

    expect(mockFn).not.toHaveBeenCalled();

    rerender({ value: ["defined", undefined] });
    expect(mockFn).not.toHaveBeenCalled();

    rerender({ value: ["defined", "defined"] });
    expect(mockFn).toHaveBeenCalledTimes(1);

    rerender({ value: ["changed", "changed"] });
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
